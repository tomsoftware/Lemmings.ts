module Lemmings {

    /** loads the config and provides an game-resources object */
    export class GameFactory {

        private configReader:ConfigReader;
        private error : ErrorHandler = new ErrorHandler("GameFactory");
        private fileProvider : FileProvider;

        constructor(private rootPath: string) {
            this.fileProvider = new FileProvider(rootPath);
            
            
            let configFileReader = this.fileProvider.loadString("config.json");
            this.configReader = new ConfigReader(configFileReader);
        }


       

        public getGameResources(gameType : GameTypes) : Promise<GameResources> {

            return new Promise<GameResources>((resolve, reject)=> {

                this.configReader.getConfig(gameType).then(config => {

                    if (config == null) {
                        reject();
                        return;
                    }

                    resolve(new GameResources(this.fileProvider, config));
                });

            });
        }
    }

}