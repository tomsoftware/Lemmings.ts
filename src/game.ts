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
        private gameGui: GameGui;
        private guiDispaly: GameDisplay = null;
        private lemmingsLeft = 0;
        private dispaly: GameDisplay = null;
        private gameTimer: GameTimer = null;
        private releaseTickIndex : number = 0;
        private skills:GameSkills;

        constructor(gameResources: GameResources) {
            this.gameResources = gameResources;
        }

        public setGameDispaly(dispaly:GameDisplay){
            this.dispaly = dispaly;
        }

        public setGuiDisplay(dispaly:GameDisplay) {
            this.guiDispaly = dispaly;

            if (this.gameGui != null) {
                this.gameGui.setGuiDisplay(dispaly);
            }
        }

        /** load a new game/level */
        public loadLevel(levelGroupIndex: number, levelIndex: number):Promise<Game> {

            this.levelGroupIndex = levelGroupIndex;
            this.levelIndex = levelIndex;

            return new Promise<Game>((resolve, reject) => {

                this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex)
                .then(level => {

                    this.gameTimer = new GameTimer(level);
                    this.gameTimer.onGameTick.on(() => {
                         this.onGameTimerTick() 
                    });

                    this.skills = new GameSkills(level);

                    this.level = level;
                    return this.gameResources.getLemmingsSprite(level.colorPalette);
                })
                .then(lemSprite => {
                    /// setup Lemmings
                    this.lemmingManager = new LemmingManager(lemSprite);

                    this.lemmingsLeft =  this.level.releaseCount;
                    
                    this.releaseTickIndex = 99;
               
                    return this.gameResources.getSkillPanelSprite(this.level.colorPalette);

                })
                .then(skillPanelSprites => {
                    /// setup gui
                    this.gameGui = new GameGui(skillPanelSprites, this.skills, this.gameTimer);
            
                    if (this.dispaly != null) {
                        this.gameGui.setGuiDisplay(this.dispaly);
                    }
                    
                    /// let's start!
                    resolve(this);
                });
                
            });
        }


        /** run the game */
        public start() {
            this.gameTimer.continue();
        }

        /** return the game Timer for this game */
        public getGameTimer():GameTimer {
            return this.gameTimer;
        }

        /** run one step in game time and render the result */
        private onGameTimerTick() {
            /// run game logic
            this.runGameLogic();
            this.render();
        }

        
        /** run the game logic one step in time */
        public runGameLogic() {
            if (this.level == null) {
                this.error.log("level not loaded!");
                return;
            }

            this.addNewLemmings();

            this.lemmingManager.tick(this.level);

        }


        /** refresh display */ 
        private render() {
            if (this.dispaly) {
               this.level.render(this.dispaly);
               this.lemmingManager.render(this.dispaly);
               //this.dispaly.redraw();
            }

            if (this.guiDispaly) {
                this.gameGui.render();
            }
            
            this.guiDispaly.redraw();
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


        public getScreenPositionX():number {
            return this.level.screenPositionX;
        }
    }

}