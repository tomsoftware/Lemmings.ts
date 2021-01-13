import { GameConfig } from './config/game-config';
import { FileContainer } from './resources/file/file-container';
import { FileProvider } from './resources/file/file-provider';
import { MainImageSprites } from './resources/main-image-sprites';
import { LemmingsSprite } from './resources/lemmings-sprite';
import { ColorPalette } from './resources/lemmings/color-palette';
import { Level } from './resources/level';
import { LevelLoader } from './resources/level-loader';
import { MaskProvider } from './resources/mask-provider';
import { SkillPanelSprites } from './resources/skill-panel-sprites';
import { AudioPlayer } from './resources/sound/audio-player';
import { SoundImageManager } from './resources/sound/sound-image-manager';
import { SoundImagePlayer } from './resources/sound/sound-image-player';

/** represent access to the resources of a Lemmings Game */
export class GameResources {

    private musicPlayer: AudioPlayer | null = null;
    private soundPlayer: AudioPlayer | null = null;
    private soundImage: Promise<SoundImageManager> | null = null;
    private mainDat: Promise<FileContainer> | null = null;

    constructor(private fileProvider: FileProvider, private config: GameConfig) {

    }

    /** free resources */
    public dispose() {
        this.stopMusic();
        this.stopSound();
        this.soundImage;
    }

    /** return the main.dat file container */
    public getMainDat(): Promise<FileContainer> {
        if (this.mainDat) {
            return this.mainDat;
        }

        this.mainDat = new Promise<FileContainer>((resolve) => {

            this.fileProvider.loadBinary(this.config.path, 'MAIN.DAT')
                .then((data) => {

                    /// split the file in it's parts
                    resolve(new FileContainer(data));
                });
        });

        return this.mainDat;
    }


    /** return the Lemmings animations */
    public async getLemmingsSprite(colorPalette: ColorPalette): Promise<LemmingsSprite> {
        const container = await this.getMainDat();
        return new LemmingsSprite(container.getPart(0), colorPalette);
    }


    public async getSkillPanelSprite(colorPalette: ColorPalette): Promise<SkillPanelSprites> {
        const container = await this.getMainDat();
        return new SkillPanelSprites(container.getPart(2), container.getPart(6), colorPalette);
    }

    public async getMasks(): Promise<MaskProvider> {
        const container = await this.getMainDat();
        return new MaskProvider(container.getPart(1));
    }

    /** return images for the games start screen */
    public async getMainImageSprites(): Promise<MainImageSprites> {
        const container = await this.getMainDat();

        return new MainImageSprites(container.getPart(3), container.getPart(4));
    }


    /** return the Level Data for a given Level-Index */
    public getLevel(levelMode: number, levelIndex: number): Promise<Level | undefined> {

        const levelReader = new LevelLoader(this.fileProvider, this.config);
        return levelReader.getLevel(levelMode, levelIndex);
    }


    /** return the level group names for this game */
    public getLevelGroups(): string[] {
        return this.config.level.groups;
    }


    private initSoundImage(): Promise<SoundImageManager> {
        if (this.soundImage) {
            // cached sound image
            return this.soundImage;
        }

        this.soundImage = new Promise<SoundImageManager>((resolve) => {

            /// load the adlib file
            this.fileProvider.loadBinary(this.config.path, 'ADLIB.DAT')
                .then((data) => {

                    /// unpack the file
                    const container = new FileContainer(data);

                    /// create Sound Image
                    const soundImage = new SoundImageManager(container.getPart(0), this.config.audioConfig);

                    resolve(soundImage);
                });
        });

        return this.soundImage;
    }


    /** stop playback of the music song */
    public stopMusic() {
        if (!this.musicPlayer) {
            return;
        }

        this.musicPlayer.stop();
        this.musicPlayer = null;
    }

    /** return a audio player to playback a music song */
    public async getMusicPlayer(songIndex: number): Promise<AudioPlayer> {
        this.stopMusic();

        const soundImage = await this.initSoundImage();
        /// get track
        const adlibSrc: SoundImagePlayer = soundImage.getMusicTrack(songIndex);

        /// play
        this.musicPlayer = new AudioPlayer(adlibSrc);

        return this.musicPlayer;
    }


    /** stop playback of the music song */
    public stopSound() {
        if (!this.soundPlayer) {
            return;
        }

        this.soundPlayer.stop();
        this.soundPlayer = null;
    }

    /** return a player to playback a sound effect */
    public async getSoundPlayer(soundIndex: number) {

        this.stopSound();

        const soundImage = await this.initSoundImage();

        /// get track
        const adlibSrc: SoundImagePlayer = soundImage.getSoundTrack(soundIndex);

        /// play
        this.soundPlayer = new AudioPlayer(adlibSrc);

        /// return
        return this.soundPlayer;
    }


}

