  module Lemmings {

    /** Bootstrap the Level loading */
    export class LevelLoader {


        private error : ErrorHandler = new ErrorHandler("LevelLoader");
        private levelIndexResolve : LevelIndexResolve;

        constructor(private fileProvider:FileProvider, private config: GameConfig) {
            this.levelIndexResolve = new LevelIndexResolve(config);
          
        }


      
        /** return the map and it's config */
        public getLevel(levelMode:number, levelIndex:number):Promise<Level> {

            let level = new Level();

            let levelReader:LevelReader;

            return new Promise<Level>((resolve, reject)=> {
                let levelInfo:LevelIndexType = this.levelIndexResolve.resolve(levelMode, levelIndex);
                if (levelInfo == null){
                    resolve(null);
                    return;
                }

                let useOddTable = levelInfo.useOddTable && this.config.level.useOddTable;

                let promiseList:Promise<BinaryReader>[] = [];

                let paddedFileId = ("0000" + levelInfo.fileId).slice(-3);
                promiseList.push(this.fileProvider.loadBinary(this.config.path, this.config.level.filePrefix + paddedFileId +".DAT"));

                /// may we need to load the odd-table to?
                if (useOddTable){
                    promiseList.push(this.fileProvider.loadBinary(this.config.path, "ODDTABLE.DAT"));
                }
                

                Promise.all(promiseList)
                    .then(files => {

                        /// read the level meta data
                        let levelsContainer = new FileContainer(files[0]);
                        levelReader = new LevelReader(levelsContainer.getPart(levelInfo.partIndex));

                        level.gameType = this.config.gametype;
                        level.levelIndex = levelIndex;
                        level.levelMode = levelMode;

                        level.width = levelReader.levelWidth;
                        level.height = levelReader.levelHeight;

                        level.screenPositionX = levelReader.screenPositionX;
                        level.isSuperLemming = levelReader.isSuperLemming;
                        
                        /// default level properties
                        let levelProperties = levelReader.levelProperties
                        
                        /// switch level properties to odd table config
                        if (useOddTable){
                            let oddTable = new OddTableReader(files[1]);
                            levelProperties = oddTable.getLevelProperties(levelInfo.levelNumber);
                        }

                        level.name = levelProperties.levelName;
                        level.releaseRate = levelProperties.releaseRate;
                        level.releaseCount = levelProperties.releaseCount;
                        level.needCount = levelProperties.needCount;
                        level.timeLimit = levelProperties.timeLimit;
                        level.skills = levelProperties.skills;

                        let fileList:Promise<BinaryReader>[] = [];

                        /// load level ground
                        fileList.push(this.fileProvider.loadBinary(this.config.path, "VGAGR"+ levelReader.graphicSet1 +".DAT"));
                        fileList.push(this.fileProvider.loadBinary(this.config.path, "GROUND"+ levelReader.graphicSet1 +"O.DAT"));

                        if (levelReader.graphicSet2 != 0) {
                            /// this is a Image Map
                            fileList.push(this.fileProvider.loadBinary(this.config.path, "VGASPEC"+ (levelReader.graphicSet2 - 1) +".DAT"));
                        }

                        return Promise.all(fileList);
                    })
                    .then((fileList) => {

                        let goundFile = fileList[1];
                        let vgaContainer = new FileContainer(fileList[0]);
                        
                        /// read the images used for the map and for the objects of the map
                        let groundReader = new GroundReader(goundFile, vgaContainer.getPart(0), vgaContainer.getPart(1));

                        /// render the map background image
                        let render = new GroundRenderer();

                        if (fileList.length > 2){
                            /// use a image for this map background
                            let vgaspecReader = new VgaspecReader(fileList[2]);

                            render.createVgaspecMap(levelReader, vgaspecReader);
                        }
                        else {
                            /// this is a normal map background
                            render.createGroundMap(levelReader, groundReader.getTerraImages());
                        }

                        
                        level.setGroundImage(render.img.data);
                        level.groundMask = render.img.mask

                        level.width = render.img.width;
                        level.height = render.img.height;

                        level.setMapObjects(levelReader.objects, groundReader.getObjectImages());
                        level.setPalettes(groundReader.colorPallet, groundReader.groundPallet, groundReader.previewPallet);

                        resolve(level);
                        
                  });
                 
            });
        }
        
    }
 }
 
 
 