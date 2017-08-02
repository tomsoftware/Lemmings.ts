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

                let useImageMap:boolean = false;
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
                  

                        /// load level ground
                        let vgaFilePromise = this.fileProvider.loadBinary(this.config.path, "VGAGR"+ levelReader.graphicSet1 +".DAT");
                        let goundFilePromise;

                        if (levelReader.graphicSet2 == 0) {
                            /// this is an normal map
                            goundFilePromise = this.fileProvider.loadBinary(this.config.path, "GROUND"+ levelReader.graphicSet1 +"O.DAT");
                        }
                        else {
                            /// this is a Image Map
                            goundFilePromise = this.fileProvider.loadBinary(this.config.path, "VGASPEC"+ (levelReader.graphicSet2 - 1) +".DAT");
                            useImageMap = true;
                        }

                        return Promise.all([vgaFilePromise, goundFilePromise]);
                    })
                    .then((res) => {

                        let goundFile = res[1];
                        let vgaContainer = new FileContainer(res[0]);

                        let render = new GroundRenderer();

                        if (useImageMap){
                            let vgaspecReader = new VgaspecReader(goundFile);

                            render.readVgaspecMap(levelReader, vgaspecReader);
                        }
                        else {
                            let groundReader = new GroundReader(goundFile, vgaContainer.getPart(1), vgaContainer.getPart(0));

                            render.readGroundMap(levelReader, groundReader);
                        }


                        level.groundImage = render.img.imgData;

                        level.width = render.img.width;
                        level.height = render.img.height;

                        resolve(level);
                        
                  });
                 
            });
        }
        
    }
 }
 
 
 