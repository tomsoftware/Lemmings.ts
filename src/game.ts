module Lemmings {

    /** provides an game object to controle the game */
    export class Game {

        private error: ErrorHandler = new ErrorHandler("Game");
        private gameResources: GameResources = null;
        private levelGroupIndex: number;
        private levelIndex: number;
        private level: Level;
        private triggerManager: TriggerManager;
        private lemmingManager: LemmingManager;
        private objectManager: ObjectManager;

        private gameVictoryCondition: GameVictoryCondition;

        private gameGui: GameGui;
        private guiDispaly: DisplayImage = null;

        private dispaly: DisplayImage = null;
        private gameDispaly: GameDisplay = null;
        private gameTimer: GameTimer = null;

        private skills: GameSkills;

        constructor(gameResources: GameResources) {
            this.gameResources = gameResources;
        }

        public setGameDispaly(dispaly: DisplayImage) {
            this.dispaly = dispaly;

            if (this.gameDispaly != null) {
                this.gameDispaly.setGuiDisplay(dispaly);
            }
        }

        public setGuiDisplay(dispaly: DisplayImage) {
            this.guiDispaly = dispaly;

            if (this.gameGui != null) {
                this.gameGui.setGuiDisplay(dispaly);
            }
        }

        /** load a new game/level */
        public loadLevel(levelGroupIndex: number, levelIndex: number): Promise<Game> {

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

                        this.gameVictoryCondition = new GameVictoryCondition(level);

                        this.triggerManager = new TriggerManager(this.gameTimer);
                        this.triggerManager.addRange(level.triggers);

                        /// request next resources
                        let maskPromis = this.gameResources.getMasks();
                        let lemPromis = this.gameResources.getLemmingsSprite(this.level.colorPalette);

                        return Promise.all([maskPromis, lemPromis]);
                    })
                    .then(results => {
                        let masks = results[0];
                        let lemSprite = results[1];

                        /// setup Lemmings
                        this.lemmingManager = new LemmingManager(this.level, lemSprite, this.triggerManager, this.gameVictoryCondition, masks);

                        return this.gameResources.getSkillPanelSprite(this.level.colorPalette);

                    })
                    .then(skillPanelSprites => {
                        /// setup gui
                        this.gameGui = new GameGui(skillPanelSprites, this.skills, this.gameTimer, this.gameVictoryCondition);

                        if (this.guiDispaly != null) {
                            this.gameGui.setGuiDisplay(this.guiDispaly);
                        }

                        this.objectManager = new ObjectManager(this.gameTimer);
                        this.objectManager.addRange(this.level.objects);

                        this.gameDispaly = new GameDisplay(this.skills, this.level, this.lemmingManager, this.objectManager, this.triggerManager);
                        if (this.dispaly != null) {
                            this.gameDispaly.setGuiDisplay(this.dispaly);
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
        public getGameTimer(): GameTimer {
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

            this.lemmingManager.tick();
        }


        /** refresh display */
        private render() {
            if (this.gameDispaly) {
                this.gameDispaly.render();
            }

            if (this.guiDispaly) {
                this.gameGui.render();
            }

            this.guiDispaly.redraw();
        }

        /** return the id of the lemming at a scene position */
        /*
        public getLemmingAt(x: number, y:number):Lemming {
            if (this.lemmingManager == null) return null;
            return this.lemmingManager.getLemmingAt(x, y);
        }
        */

        /*
        public setLemmingAction(lem: Lemming, action:ActionType){
            if (this.lemmingManager == null) return null;

            this.lemmingManager.setLemmingAction(lem, ActionType.DIGG);
        }
        */



        public getScreenPositionX(): number {
            return this.level.screenPositionX;
        }
    }

}