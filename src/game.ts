module Lemmings {

    /** provides an game object to controle the game */
    export class Game {

        private error: LogHandler = new LogHandler("Game");
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

        public onGameEnd = new EventHandler<GameStateTypes>();

        private finalGameState:GameStateTypes = GameStateTypes.UNKNOWN;

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

        /** end the game */
        public stop() {
            this.gameTimer.stop();
            this.gameTimer = null;

            this.onGameEnd.dispose();
            this.onGameEnd = null;

        }


        /** return the game Timer for this game */
        public getGameTimer(): GameTimer {
            return this.gameTimer;
        }


        /** run one step in game time and render the result */
        private onGameTimerTick() {

            /// run game logic
            this.runGameLogic();
            this.checkForGameOver();
            this.render();
        }

        /** return the current state of the game */
        public getGameState():GameStateTypes {

            /// if the game hase finised return it's saved state
            if (this.finalGameState != GameStateTypes.UNKNOWN) {
                return this.finalGameState;
            }

            if ((this.gameVictoryCondition.GetLeftCount() <= 0) && (this.gameVictoryCondition.GetOutCount() <= 0)) {
                if (this.gameVictoryCondition.GetSurvivorsCount() >= this.gameVictoryCondition.GetNeedCount()) {
                    return GameStateTypes.SUCCEEDED;
                }
                else {
                    return GameStateTypes.FAILED_LESS_LEMMINGS;
                }
            }

            if (this.gameTimer.getGameLeftTime() <= 0) {
                return GameStateTypes.FAILED_OUT_OF_TIME;
            }

            return GameStateTypes.RUNNING;

        }

        /** check if the game  */
        private checkForGameOver() {
            if (this.finalGameState != GameStateTypes.UNKNOWN) {
                return;
            }

            let state = this.getGameState();

            if ((state != GameStateTypes.RUNNING) && (state != GameStateTypes.UNKNOWN)) {
                this.finalGameState = state;
                this.onGameEnd.trigger(state);
            }
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



        public getScreenPositionX(): number {
            return this.level.screenPositionX;
        }
    }

}