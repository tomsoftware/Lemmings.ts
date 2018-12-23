

module Lemmings {

    /** reprecent access to the resources of a Lemmings Game */
    export class GameResources {

        private musicPlayer: AudioPlayer;
        private soundPlayer: AudioPlayer;
        private soundImage: Promise<SoundImageManager>;
        private mainDat: Promise<FileContainer> = null;

        constructor(private fileProvider: FileProvider, private config: GameConfig) {

        }

        /** free resources */
        public dispose() {
            this.stopMusic();
            this.stopSound();
            this.soundImage = null;
        }

        /** return the main.dat file container */
        public getMainDat():Promise<FileContainer> {
            if (this.mainDat != null) return this.mainDat;

            this.mainDat = new Promise<FileContainer>((resolve, reject) => {

                this.fileProvider.loadBinary(this.config.path, "MAIN.DAT")
                .then(data => {

                    /// split the file in it's parts
                    let mainParts = new FileContainer(data);

                    resolve(mainParts);
                });
            });

            return this.mainDat;
        }


        /** return the Lemings animations */
        public getLemmingsSprite(colorPalette:ColorPalette): Promise<LemmingsSprite> {

            return new Promise<LemmingsSprite>((resolve, reject) => {

                this.getMainDat().then(container => {
                    
                    let sprite = new LemmingsSprite(container.getPart(0), colorPalette);

                    resolve(sprite);
                });
            });
        }


        public getSkillPanelSprite(colorPalette:ColorPalette): Promise<SkillPanelSprites> {
            return new Promise<SkillPanelSprites>((resolve, reject) => {

                this.getMainDat().then(container => {

                    resolve(new SkillPanelSprites(container.getPart(2), container.getPart(6), colorPalette));
                });
            });
        }


        /** return the Level Data for a given Level-Index */
        public getLevel(levelMode: number, levelIndex: number): Promise<Level> {

            let levelReader = new LevelLoader(this.fileProvider, this.config);
            return levelReader.getLevel(levelMode, levelIndex);
        }


        /** return the level group names for this game */
        public getLevelGroups(): string[] {
            return this.config.level.groups;
        }


        private initSoundImage() {
            if (this.soundImage) return this.soundImage;

            this.soundImage = new Promise<SoundImageManager>((resolve, reject) => {

                /// load the adlib file
                this.fileProvider.loadBinary(this.config.path, "ADLIB.DAT")
                    .then((data: BinaryReader) => {

                        /// unpack the file
                        var container = new FileContainer(data);

                        /// create Sound Image
                        var soundImage = new SoundImageManager(container.getPart(0), this.config.audioConfig);

                        resolve(soundImage);
                    });
            });

            return this.soundImage;
        }


        /** stop playback of the music song */
        public stopMusic() {
            if (this.musicPlayer != null) {
                this.musicPlayer.stop();
                this.musicPlayer = null;
            }
        }

        /** return a palyer to playback a music song */
        public getMusicPlayer(songIndex: number): Promise<AudioPlayer> {
            this.stopMusic();

            return new Promise<AudioPlayer>((resolve, reject) => {

                this.initSoundImage().then(soundImage => {

                    /// get track
                    var adlibSrc: SoundImagePlayer = soundImage.getMusicTrack(songIndex);

                    /// play
                    this.musicPlayer = new AudioPlayer(adlibSrc);

                    /// return
                    resolve(this.musicPlayer);
                });
            });
        }


        /** stop playback of the music song */
        public stopSound() {
            if (this.soundPlayer != null) {
                this.soundPlayer.stop();
                this.soundPlayer = null;
            }
        }

        /** return a palyer to playback a sound effect */
        public getSoundPlayer(sondIndex: number) {

            this.stopSound();

            return new Promise<AudioPlayer>((resolve, reject) => {

                this.initSoundImage().then(soundImage => {

                    /// get track
                    var adlibSrc: SoundImagePlayer = soundImage.getSoundTrack(sondIndex);

                    /// play
                    this.soundPlayer = new AudioPlayer(adlibSrc);

                    /// return
                    resolve(this.soundPlayer);
                });
            });
        }


    }

}