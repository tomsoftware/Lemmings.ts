module Lemmings {

    /** provides an game object to controle the game */
    export class Game {

        private error: ErrorHandler = new ErrorHandler("Game");
        private gameResources: GameResources = null;
        private levelGroupIndex: number;
        private levelIndex: number;
        private level:Level;
        private lemmingManager:LemmingManager;
        private lemmingsLeft = 0;

        constructor(gameResources: GameResources) {
            this.gameResources = gameResources;
        }


        public load(levelGroupIndex, levelIndex):Promise<Game> {

            this.levelGroupIndex = levelGroupIndex;
            this.levelIndex = levelIndex;

            return new Promise<Game>((resolve, reject) => {

                let levelProm = this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex);
                let lemSpriteProm = this.gameResources.getLemmingsSprite();

                Promise.all([levelProm, lemSpriteProm]).then(result => {

                    this.level = result[0];
                    let lemSprite = result[1];
                    this.lemmingManager = new LemmingManager(lemSprite);

                    this.lemmingsLeft =  this.level.releaseCount;

                    resolve(this);

                });
            });
        }


        /** run the game */
        public run() {

            let entrance = this.level.mapObjects[this.lemmingsLeft % this.level.mapObjects.length];
            
            this.lemmingManager.addLemming(entrance.x, entrance.y);

            setInterval(()=>this.tick(), 200);
        }


        public tick() {
            if (this.level == null) {
                this.error.log("level not loaded!");
                return;
            }

            this.lemmingManager.tick(this.level);

        }
    }

}