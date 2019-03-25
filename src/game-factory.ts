module Lemmings {

    /** loads the config and provides an game-resources object */
    export class GameFactory {

        private configReader:ConfigReader;
        private fileProvider : FileProvider;

        constructor(private rootPath: string) {
            this.fileProvider = new FileProvider(rootPath);
            
            let configFileReader = this.fileProvider.loadString("config.json");
            this.configReader = new ConfigReader(configFileReader);
        }


        /** return a game object to controle/run the game */
        public getGame(gameType : GameTypes) : Promise<Game> {

            return new Promise<Game>((resolve, reject)=> {

                /// load resources
                this.getGameResources(gameType)
                    .then(res => resolve(new Game(res)));
            });

        }
       
        /** return the config of a game type */
        public getConfig(gameType : GameTypes) : Promise<GameConfig> {
            return this.configReader.getConfig(gameType);
        }

        /** return a Game Resources that gaves access to images, maps, sounds  */
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