/// <reference path="./gameplay/action-type.ts"/>

module Lemmings {

    /** provides an game object to controle the game */
    export class Game {

        private error: ErrorHandler = new ErrorHandler("Game");
        private gameResources: GameResources = null;
        private levelGroupIndex: number;
        private levelIndex: number;
        private level: Level;
        private lemmingManager: LemmingManager;
        private gui: GameGui;
        private lemmingsLeft = 0;
        private dispaly: GameDisplay = null;
        private gameTimer: number = 0;
        /** the current game time in number of steps the game has made  */
        private tickIndex : number = 0;
        private releaseTickIndex : number = 0;

        constructor(gameResources: GameResources) {
            this.gameResources = gameResources;
        }

        public setDispaly(dispaly:GameDisplay){
            this.dispaly = dispaly;
        }

        /** load a new game/level */
        public loadLevel(levelGroupIndex: number, levelIndex: number):Promise<Game> {

            this.levelGroupIndex = levelGroupIndex;
            this.levelIndex = levelIndex;

            return new Promise<Game>((resolve, reject) => {

                this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex)
                .then(level => {

                    this.level = level;
                    return this.gameResources.getLemmingsSprite(level.colorPallet);
                })
                .then(lemSprite => {

                    this.lemmingManager = new LemmingManager(lemSprite);

                    this.lemmingsLeft =  this.level.releaseCount;
                    
                    this.tickIndex = 0;
                    this.releaseTickIndex = 99;

                    resolve(this);
                });
                
            });
        }


        /** run the game */
        public start() {
            this.continue();
        }

        /** Pause the game */
        public suspend() {
            if (this.gameTimer != 0)
            clearInterval(this.gameTimer);
            this.gameTimer = 0;
        }


        /** Run the game timer */
        public continue() {
            if (this.gameTimer != 0) return;

            this.gameTimer = setInterval(()=>{

                /// run game logic
                this.tick();
                this.render();
            }, 20);
        }


        /** refresh display */ 
        private render() {
          
            if (this.dispaly) {
                this.dispaly.initRender(this.level.width, this.level.height);

                this.level.render(this.dispaly);
                
                this.lemmingManager.render(this.dispaly);

                //this.gui.render(this.dispaly);

                this.dispaly.redraw();
            }
        }

        
        /** run the game logic one step in time */
        public tick() {
            if (this.level == null) {
                this.error.log("level not loaded!");
                return;
            }

            this.tickIndex++;

            this.addNewLemmings();

            this.lemmingManager.tick(this.level);

        }

        /** return the id of the lemming at a scene position */
        public getLemmingAt(x: number, y:number):Lemming {
            if (this.lemmingManager == null) return null;
            return this.lemmingManager.getLemmingAt(x, y);
        }

        public setLemmingAction(lem: Lemming, action:ActionType){
            if (this.lemmingManager == null) return null;

            this.lemmingManager.setLemmingAction(lem, ActionType.DIGG);
        }


        private addNewLemmings() {
            if (this.lemmingsLeft <= 0) return;

            this.releaseTickIndex++;

            if (this.releaseTickIndex >=  (100 - this.level.releaseRate)) {
                this.releaseTickIndex = 0;

                let entrance = this.level.mapObjects[0];
            
                this.lemmingManager.addLemming(entrance.x, entrance.y);

                this.lemmingsLeft--;
            }
        }


        /** return the past game time in seconds */
        public getGameTime():number {
            return Math.floor(this.tickIndex / 60);
        }

        /** return the maximum time in seconds to win the game  */
        public getGameTimeLimit():number {
            return this.level.timeLimit;
        }

        public getScreenPositionX():number {
            return this.level.screenPositionX;
        }
    }

}