

module Lemmings {
    
    /** reprecent access to the resources of a  Lemmings Game */
    export class GameResources {

        private musicPlayer:AudioPlayer;
        private soundPlayer:AudioPlayer;
        private soundImage:Promise<SoundImageReader>;


        constructor(private fileProvider: FileProvider, private config: GameConfig) {

        }

        /** free resources */
        public dispose() {
            this.stopMusic();
            this.stopSound();
            this.soundImage = null;
        }

        /** return the Level Data for a given Level-Index */
        public getLevel(levelMode:number, levelIndex:number):Promise<Level> {

            let levelReader = new LevelLoader(this.fileProvider, this.config);
            return levelReader.getLevel(levelMode, levelIndex);
        }


        /** return the level group names for this game */
        public getLevelGroups():string[] {
            return this.config.level.groups;
        }


        private initSoundImage() {
            if (this.soundImage) return this.soundImage;

            this.soundImage = new Promise<SoundImageReader>((resolve, reject) => {

                /// load the adlib file
                this.fileProvider.loadBinary(this.config.path , "ADLIB.DAT")
                    .then((data: BinaryReader) => {

                        /// unpack the file
                        var container = new FileContainer(data);

                        /// create Sound Image
                        var soundImage = new SoundImageReader(container.getPart(0), this.config.audioConfig);

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
        public getMusicPlayer(songIndex: number):Promise<AudioPlayer> {
            this.stopMusic();
 
            return new Promise<AudioPlayer>((resolve, reject) => {

                this.initSoundImage().then(soundImage =>{

                    /// get track
                    var adlibSrc: AdlibPlayer = soundImage.getMusicTrack(songIndex);
                    
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

                this.initSoundImage().then(soundImage =>{

                    /// get track
                    var adlibSrc: AdlibPlayer = soundImage.getSoundTrack(sondIndex);
                    
                    /// play
                    this.soundPlayer = new AudioPlayer(adlibSrc);

                    /// return
                    resolve(this.soundPlayer);
                });
            });
        }
        

    }

}