module Lemmings {

    export class DebugView {
        private log : LogHandler = new LogHandler("DebugView");

        private levelIndex: number = 0;
        private levelGroupIndex: number = 0;
        private gameType: GameTypes;
        private musicIndex: number = 0;
        private soundIndex: number = 0;
        private gameResources: GameResources = null;
        private musicPlayer: AudioPlayer = null;
        private soundPlayer: AudioPlayer = null;
        private game : Game = null;
        private gameFactory = new GameFactory("./");

        private stage : Stage = null;
        
        public elementSoundNumber: HTMLElement = null;
        public elementTrackNumber: HTMLElement = null;
        public elementLevelNumber: HTMLElement = null;
        public elementSelectedGame: HTMLSelectElement = null;
        public elementSelectLevelGroup: HTMLSelectElement = null;
        public elementLevelName: HTMLElement = null;
        public elementGameState: HTMLElement = null;

        private gameSpeedFactor = 1;


        public constructor() {
            /// split the hash of the url in parts + reverse
            let hashParts = window.location.hash.substr(1).split(",", 3).reverse();
      
            this.levelIndex = this.strToNum(hashParts[0]);
            this.levelGroupIndex = this.strToNum(hashParts[1]);
            this.gameType = this.strToNum(hashParts[2]) + 1;

            this.log.log("selected level: "+ GameTypes.toString(this.gameType) +" : "+ this.levelIndex + " / "+ this.levelGroupIndex);
        }

  
        public set gameCanvas(el:HTMLCanvasElement){
            this.stage = new Stage(el);
        }
        
        
        /** start or continue the game */
        public start() {
            if (!this.gameFactory) return;

            /// is the game already running
            if (this.game != null) {
                this.continue();
                return;
            }

            /// create new game
            this.gameFactory.getGame(this.gameType)
                .then(game => game.loadLevel(this.levelGroupIndex, this.levelIndex))
                .then(game => {

                    game.setGameDispaly(this.stage.getGameDisplay());
                    game.setGuiDisplay(this.stage.getGuiDisplay());

                    game.getGameTimer().speedFactor = this.gameSpeedFactor;

                    game.start();

                    this.changeHtmlText(this.elementGameState, GameStateTypes.toString(GameStateTypes.RUNNING));

                    game.onGameEnd.on((state) => this.onGameEnd(state));

                    this.game = game;
                });
        }


        private onGameEnd(state : GameStateTypes) {
            this.changeHtmlText(this.elementGameState, GameStateTypes.toString(state));
            this.stage.startFadeOut();

            
            window.setTimeout(() => {
                if (state == GameStateTypes.SUCCEEDED) {
                    /// move to next level
                    this.moveToLevel(1);
                }
                else {
                    /// redo this level
                    this.moveToLevel(0);
                }
                
            }, 2500);
        }


        /** pause the game */
        public cheat() {
            if (this.game == null) {
                return;
            }

            this.game.cheat();
        }

        /** pause the game */
        public suspend() {
            if (this.game == null) {
                return;
            }

            this.game.getGameTimer().suspend(); 
        }

        /** continue the game after pause/suspend */
        public continue() {
            if (this.game == null) {
                return;
            }
            
            this.game.getGameTimer().continue(); 
        }

        public nextFrame() {
            if (this.game == null) {
                return;
            }
            
            this.game.getGameTimer().tick();
        }

        public selectSpeedFactor(newSpeed: number) {
            if (this.game == null) {
                return;
            }

            this.gameSpeedFactor = newSpeed;
            this.game.getGameTimer().speedFactor = newSpeed;
        }


        public playMusic(moveInterval: number) {

            this.stopMusic();
            if (!this.gameResources) return;

            if (moveInterval == null) moveInterval = 0;
            this.musicIndex += moveInterval;
            this.musicIndex = (this.musicIndex < 0) ? 0 : this.musicIndex;

            this.changeHtmlText(this.elementTrackNumber, this.musicIndex.toString());

            this.gameResources.getMusicPlayer(this.musicIndex)
                .then((player) => {
                    this.musicPlayer = player;
                    this.musicPlayer.play();
                });
        }


        public stopMusic() {
            if (this.musicPlayer) {
                this.musicPlayer.stop();
                this.musicPlayer = null;
            }
        }


        public stopSound() {
            if (this.soundPlayer) {
                this.soundPlayer.stop();
                this.soundPlayer = null;
            }
        }

        public playSound(moveInterval: number) {
            this.stopSound();

            if (moveInterval == null) moveInterval = 0;

            this.soundIndex += moveInterval;

            this.soundIndex = (this.soundIndex < 0) ? 0 : this.soundIndex;

            this.changeHtmlText(this.elementSoundNumber, this.soundIndex.toString());


            this.gameResources.getSoundPlayer(this.soundIndex)
                .then((player) => {
                    this.soundPlayer = player;
                    this.soundPlayer.play();
                });
        }


        /** add/subtract one to the current levelIndex */
        public moveToLevel(moveInterval: number) {
            if (moveInterval == null) moveInterval = 0;
            this.levelIndex = (this.levelIndex + moveInterval)| 0;

            /// check if the levelIndex is out of bounds
            this.gameFactory.getConfig(this.gameType).then((config) => {

                /// jump to next level group?
                if (this.levelIndex >= config.level.getGroupLength(this.levelGroupIndex)) {
                    this.levelGroupIndex ++;
                    this.levelIndex = 0;
                }

                /// jump to previous level group?
                if ((this.levelIndex < 0) && (this.levelGroupIndex > 0)) {
                    this.levelGroupIndex --;
                    this.levelIndex = config.level.getGroupLength(this.levelGroupIndex) - 1;
                }

                /// update and load level
                this.changeHtmlText(this.elementLevelNumber, (this.levelIndex + 1).toString());
                this.loadLevel();
            });
        }


        /** return the url hash for the pressent game/group/level-index */
        private buildLevelIndexHash() : string {
            return (this.gameType - 1) +","+ this.levelGroupIndex +","+ this.levelIndex;
        }

        /** convert a string to a number */
        private strToNum(str:string):number {
            return Number(str)|0;
        }

        /** change the the text of a html element */
        private changeHtmlText(htmlElement:HTMLElement, value:string) {
            if (htmlElement == null) {
                return
            }

            htmlElement.innerText = value;
        }

        /** remove items of a <select> */
        private clearHtmlList(htmlList: HTMLSelectElement) {
            while (htmlList.options.length) {
                htmlList.remove(0);
            }
        }

        /** add array elements to a <select> */
        private arrayToSelect(htmlList: HTMLSelectElement, list: string[]):void {

            this.clearHtmlList(htmlList);

            for (var i = 0; i < list.length; i++) {
                var opt = list[i];
                var el: HTMLOptionElement = document.createElement("option");
                el.textContent = opt;
                el.value = i.toString();
                htmlList.appendChild(el);
            }
        }


        /** switch the selected level group */
        public selectLevelGroup(newLevelGroupIndex: number) {
            this.levelGroupIndex = newLevelGroupIndex;

            this.loadLevel();
        }


        /** select a game type */
        public selectGameType(gameTypeName: string) {

            if (gameTypeName == null) gameTypeName = "LEMMINGS";

            this.gameType = Lemmings.GameTypes.fromString(gameTypeName);

            this.gameFactory.getGameResources(this.gameType)
                .then((newGameResources) => {

                    this.gameResources = newGameResources;

                    this.arrayToSelect(this.elementSelectLevelGroup, this.gameResources.getLevelGroups());
                    this.levelGroupIndex = 0;

                    this.loadLevel();
                });
        }


        /** load a level and render it to the display */
        private loadLevel() {
            if (this.gameResources == null) return;
            if (this.game != null) {
                this.game.stop();
                this.game = null;
            }


            this.changeHtmlText(this.elementGameState, GameStateTypes.toString(GameStateTypes.UNKNOWN));

            this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex)
                .then((level) => {
                    if (level == null) return;

                    this.changeHtmlText(this.elementLevelName, level.name);

                    if (this.stage != null){
                        let gameDisplay = this.stage.getGameDisplay();
                        gameDisplay.clear();
                        this.stage.resetFade();
                        level.render(gameDisplay);
                        
                        gameDisplay.setScreenPosition(level.screenPositionX, 0);
                        gameDisplay.redraw();
                    }

                    window.location.hash = this.buildLevelIndexHash();

                    console.dir(level);
                });

        }

    }
}