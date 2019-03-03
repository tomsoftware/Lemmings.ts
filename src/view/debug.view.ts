module Lemmings {

    export class DebugView {

        private levelIndex = 4;
        private levelGroupIndex = 0;
        private gameType: GameTypes;
        private musicIndex = 0;
        private soundIndex = 0;
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

        private _gameCanvas: HTMLCanvasElement = null;


        public set gameCanvas(el:HTMLCanvasElement){
            this._gameCanvas = el;
   
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

                    game.start();

                    this.game = game;
                });
        }

        /** pause the game */
        public suspend() {
            this.game.getGameTimer().suspend(); 
        }

        /** continue the game after pause/suspend */
        public continue() {
            this.game.getGameTimer().continue(); 
        }

        public nextFrame() {
            this.game.getGameTimer().tick();
        }

        public playMusic(moveInterval: number) {

            this.stopMusic();
            if (!this.gameResources) return;

            if (moveInterval == null) moveInterval = 0;
            this.musicIndex += moveInterval;
            this.musicIndex = (this.musicIndex < 0) ? 0 : this.musicIndex;

            if (this.elementTrackNumber) {
                this.elementTrackNumber.innerHTML = this.musicIndex.toString();
            }

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

            if (this.elementSoundNumber) {
                this.elementSoundNumber.innerHTML = this.soundIndex.toString();
            }


            this.gameResources.getSoundPlayer(this.soundIndex)
                .then((player) => {
                    this.soundPlayer = player;
                    this.soundPlayer.play();
                });
        }



        public moveToLevel(moveInterval: number) {
            if (moveInterval == null) moveInterval = 0;
            this.levelIndex += moveInterval;

            this.levelIndex = (this.levelIndex < 0) ? 0 : this.levelIndex;

            if (this.elementLevelNumber) {
                this.elementLevelNumber.innerHTML = (this.levelIndex + 1).toString();
            }

            this.loadLevel();
        }


        private clearHtmlList(htmlList: HTMLSelectElement) {
            while (htmlList.options.length) {
                htmlList.remove(0);
            }
        }


        private arrayToSelect(htmlList: HTMLSelectElement, list: string[]) {

            this.clearHtmlList(htmlList);

            for (var i = 0; i < list.length; i++) {
                var opt = list[i];
                var el: HTMLOptionElement = document.createElement("option");
                el.textContent = opt;
                el.value = i.toString();
                htmlList.appendChild(el);
            }
        }


        public selectLevelGroup(newLevelGroupIndex: number) {
            this.levelGroupIndex = newLevelGroupIndex;

            this.loadLevel();
        }


        private selectGame(gameTypeName: string) {

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



        private loadLevel() {
            if (this.gameResources == null) return;
            if (this.game != null) {
                this.game.stop();
            }

            this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex)
                .then((level) => {
                    if (level == null) return;

                    if (this.elementLevelName) {
                        this.elementLevelName.innerHTML = level.name;
                    }

                    if (this.stage != null){
                        let gameDisplay = this.stage.getGameDisplay();
                        gameDisplay.clear();
                        level.render(gameDisplay);
                        gameDisplay.redraw();
                    }

                    console.dir(level);
                });

        }

    }
}