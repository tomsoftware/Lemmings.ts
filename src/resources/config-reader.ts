 module Lemmings {

    /** read the config.json file */
    export class ConfigReader {

        private configs: Promise<GameConfig[]>;
        private error : ErrorHandler = new ErrorHandler("ConfigReader");


        constructor(configFile: Promise<string>) {

            this.configs = new Promise<GameConfig[]>((resolve, reject)=> {

                configFile.then((jsonString) => {

                    let configJson:GameConfig[] = this.parseConfig(jsonString);

                        resolve(configJson);
                    }
                );
            });

        }


        /** return the game config for a given GameType */
        public getConfig(gameType : GameTypes) : Promise<GameConfig> {

            return new Promise<GameConfig>((resolve, reject)=> {

                this.configs.then((configs:GameConfig[]) => {


                    let config:GameConfig = configs.find((type) => type.gametype == gameType)

                    if (config == null) {
                        this.error.log("config for GameTypes:"+ GameTypes.toString(gameType) +" not found!");
                        reject();
                        return;
                    }

                    resolve(config);

                });
            });
        }


        /** pars the config file */
        private parseConfig(jsonData:string):GameConfig[] {

            let gameConfigs:GameConfig[] = []

            try {

                var config = <any[]>JSON.parse(jsonData);

            } catch(e) {

                this.error.log("Unable to parse config", e);
                return gameConfigs;
            }

            /// for all game types
            for(let c = 0; c < config.length; c++) {
                let newConfig = new GameConfig();
                let configData:{[key:string]:string} = config[c];

                newConfig.name = configData["name"];
                newConfig.path = configData["path"];
                newConfig.gametype = GameTypes.fromString(configData["gametype"]);

                if (configData["useoddtable"] != null){
                    newConfig.level.useOddTable = (!!(<any>configData["useoddtable"]));
                }
                newConfig.level.order = <any>configData["level.order"];
                newConfig.level.filePrefix = <any>configData["level.filePrefix"];
                newConfig.level.groups = <any>configData["level.groups"];

                newConfig.audioConfig.version = <any>configData["audio.version"];
                newConfig.audioConfig.adlibChannelConfigPosition = <any>configData["audio.adlibChannelConfigPosition"];
                newConfig.audioConfig.DATA_START = <any>configData["audio.DATA_START"];
                newConfig.audioConfig.sub_306_Param = <any>configData["audio.sub_306_Param"];
                newConfig.audioConfig.sub_306_POS1 = <any>configData["audio.sub_306_POS1"];
                newConfig.audioConfig.sub_306_POS2 = <any>configData["audio.sub_306_POS2"];
                newConfig.audioConfig.INIT_MUSIK_START = <any>configData["audio.INIT_MUSIK_START"];

                newConfig.audioConfig.DATA_CMD = <any>configData["audio.DATA_CMD"];
                newConfig.audioConfig.soundIndexTablePosition = <any>configData["audio.soundIndexTablePosition"];
                newConfig.audioConfig.DATA_START_SOUND = <any>configData["audio.DATA_START_SOUND"];
                newConfig.audioConfig.trackCount = <any>configData["audio.trackCount"];

                gameConfigs.push(newConfig);
            }

            return gameConfigs;

        }

    }
 }