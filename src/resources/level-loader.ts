import { GameConfig } from '../config/game-config';
import { LogHandler } from '../utilities/log-handler';
import { BinaryReader } from './file/binary-reader';
import { FileContainer } from './file/file-container';
import { FileProvider } from './file/file-provider';
import { GroundRenderer } from './ground-renderer';
import { GroundReader } from './lemmings/ground-reader';
import { LevelReader } from './lemmings/level-reader';
import { OddTableReader } from './lemmings/odd-table-reader';
import { VgaSpecReader } from './lemmings/vga-spec-reader';
import { Level } from './level';
import { LevelIndexResolve } from './level-index-resolve';
import { SolidLayer } from './solid-layer';

/** Bootstrap the Level loading */
export class LevelLoader {
    private log: LogHandler = new LogHandler('LevelLoader');
    private levelIndexResolve: LevelIndexResolve;


    constructor(private fileProvider: FileProvider, private config: GameConfig) {
        this.levelIndexResolve = new LevelIndexResolve(config);
    }

    /** return the map and it's config */
    public async getLevel(levelMode: number, levelIndex: number): Promise<Level | undefined> {

        const levelInfo = this.levelIndexResolve.resolve(levelMode, levelIndex);
        if (!levelInfo) {
            this.log.log('Unable to resolve level index: ' + levelMode + ' ' + levelIndex);
            return;
        }

        const useOddTable = levelInfo.useOddTable && this.config.level.useOddTable;

        const promiseList: Promise<BinaryReader>[] = [];

        const paddedFileId = ('0000' + levelInfo.fileId).slice(-3);
        promiseList.push(this.fileProvider.loadBinary(this.config.path, this.config.level.filePrefix + paddedFileId + '.DAT'));

        /// may we need to load the odd-table too?
        if (useOddTable) {
            promiseList.push(this.fileProvider.loadBinary(this.config.path, 'ODDTABLE.DAT'));
        }

        // fetch all needed files
        const files = await Promise.all(promiseList)


        /// read the level meta data
        const levelsContainer = new FileContainer(files[0]);
        const levelReader = new LevelReader(levelsContainer.getPart(levelInfo.partIndex));


        /// default level properties
        let levelProperties = levelReader.levelProperties;
        const width = levelReader.levelWidth;
        const height = levelReader.levelHeight;

        /// switch level properties to odd table config
        if (useOddTable) {
            const oddTable = new OddTableReader(files[1]);

            const oddLevelProperties = oddTable.getLevelProperties(levelInfo.levelNumber);
            if (!oddLevelProperties) {
                this.log.log('Unable to get level properties from odd-table!');
                return;
            }

            // overwrite levelProperties with oddTable values
            levelProperties = oddLevelProperties;
        }

        // read graphic files
        const fileList1: Promise<BinaryReader>[] = [];

        /// load level ground
        fileList1.push(this.fileProvider.loadBinary(this.config.path, 'VGAGR' + levelReader.graphicSet1 + '.DAT'));
        fileList1.push(this.fileProvider.loadBinary(this.config.path, 'GROUND' + levelReader.graphicSet1 + 'O.DAT'));

        if (levelReader.graphicSet2 != 0) {
            /// this is a Image Map
            fileList1.push(this.fileProvider.loadBinary(this.config.path, 'VGASPEC' + (levelReader.graphicSet2 - 1) + '.DAT'));
        }

        const graphicFiles = await Promise.all(fileList1);


        const groundFile = graphicFiles[1];
        const vgaContainer = new FileContainer(graphicFiles[0]);

        /// read the images used for the map and for the objects of the map
        const groundReader = new GroundReader(groundFile, vgaContainer.getPart(0), vgaContainer.getPart(1));

        /// render the map background image
        let render: GroundRenderer;

        if (graphicFiles.length > 2) {
            /// use an image for this map background
            const vgaSpecReader = new VgaSpecReader(graphicFiles[2], width, height);

            render = GroundRenderer.fromVgaSpecMap(levelReader, vgaSpecReader);
        }
        else {
            /// this is a normal map background
            render = GroundRenderer.fromGroundMap(levelReader, groundReader.getTerraImages());
        }

        const newLevel = new Level(
            width, height,
            this.config.gameType,
            levelIndex,
            levelMode,
            levelProperties,
            levelReader.screenPositionX,
            levelReader.isSuperLemming,
            render.img.getData(),
            new SolidLayer(width, height, render.img.mask),
            groundReader.colorPalette,
            groundReader.groundPalette
        );

        newLevel.setMapObjects(levelReader.objects, groundReader.getObjectImages());

        return newLevel;
    }

}

