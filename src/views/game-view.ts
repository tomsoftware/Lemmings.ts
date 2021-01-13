import { Options, Vue } from 'vue-class-component';
import { LogHandler } from '@/game/utilities/log-handler';
import { GameTypes, GameTypesHelper } from '@/game/game-types';
import { AudioPlayer } from '@/game/resources/sound/audio-player';
import { GameResources } from '@/game/game-resources';
import { GameFactory } from '@/game/game-factory';
import { Stage } from '@/game/view/stage';
import { Game } from '@/game/game';
import { GameResult } from '@/game/game-result';
import { GameStateTypeHelper, GameStateTypes } from '@/game/game-state-types';
import { Level } from '@/game/resources/level';

@Options({
    props: {
        gameState: String,
        musicIndex: Number,
        soundIndex: Number,
        levelIndex: Number
    },
    components: {
    },
})
export default class GameView extends Vue {
    private log: LogHandler = new LogHandler('GameView');

    private levelIndex = 0;
    private levelGroupIndex = 0;
    private gameType: GameTypes = GameTypes.UNKNOWN;
    private musicIndex = 0;
    private soundIndex = 0;
    private gameResources: GameResources | null = null;
    private musicPlayer: AudioPlayer | null = null;
    private soundPlayer: AudioPlayer | null = null;
    private game: Game | null = null;
    private gameFactory = new GameFactory('/data');

    private stage: Stage | null = null;

    protected level: Level | null = null;


    public gameState = '';
    private gameSpeedFactor = 1;


    public mounted() {
        const gameCanvas = this.$refs['gameCanvas'] as HTMLCanvasElement;
        this.stage = new Stage(gameCanvas);

        this.levelIndex = 0;
        this.levelGroupIndex = 0;

        if (!Array.isArray(this.$route.params['gameType'])) {
            this.gameType = parseInt(this.$route.params['gameType'], 10);
        }

        this.log.log('selected level: ' + GameTypesHelper.toString(this.gameType) + ' : ' + this.levelIndex + ' / ' + this.levelGroupIndex);


        this.selectGameType(this.gameType);
    }


    /** start or continue the game */
    public async start(replayString?: string) {

        this.level = null;

        /// is the game already running
        if (this.game) {
            this.continue();
            return;
        }

        /// create new game
        const game = await this.gameFactory.getGame(this.gameType, this.levelGroupIndex, this.levelIndex);
        if (!game) {
            this.log.log('Unable to create game!');
            return;
        }

        this.level = game.level;

        if (replayString) {
            game.getCommandManager().loadReplay(replayString);
        }


        if (this.stage) {
            game.setGameDisplay(this.stage.getGameDisplay());
            game.setGuiDisplay(this.stage.getGuiDisplay());
        }

        game.getGameTimer().speedFactor = this.gameSpeedFactor;

        game.start();
        
        this.gameState = GameStateTypeHelper.toString(GameStateTypes.RUNNING);

        game.onGameEnd.on((state) => this.onGameEnd(state));

        this.game = game;

    }


    private onGameEnd(gameResult?: GameResult) {
        if (!gameResult) {
            return;
        }

        this.gameState = GameStateTypeHelper.toString(gameResult.state);

        if (this.stage) {
            this.stage.startFadeOut();
        }


        console.dir(gameResult);

        window.setTimeout(() => {
            if (gameResult.state == GameStateTypes.SUCCEEDED) {
                /// move to next level
                this.moveToLevel(1);
            }
            else {
                /// redo this level
                this.moveToLevel(0);
            }

        }, 2500);
    }

    /** load and run a replay */
    public loadReplay(replayString: string) {
        this.start(replayString);
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


    public async playMusic(moveInterval = 0) {

        this.stopMusic();
        if (!this.gameResources) {
            return;
        }

        this.musicIndex += moveInterval;
        this.musicIndex = (this.musicIndex < 0) ? 0 : this.musicIndex;

        const player = await this.gameResources.getMusicPlayer(this.musicIndex)

        this.musicPlayer = player;
        this.musicPlayer.play();
    }


    public stopMusic() {
        if (!this.musicPlayer) {
            return;
        }

        this.musicPlayer.stop();
        this.musicPlayer = null;
    }


    public stopSound() {
        if (!this.soundPlayer) {
            return;
        }

        this.soundPlayer.stop();
        this.soundPlayer = null;
    }

    public async playSound(moveInterval = 0) {
        this.stopSound();

        this.soundIndex += moveInterval;

        this.soundIndex = (this.soundIndex < 0) ? 0 : this.soundIndex;


        if (!this.gameResources) {
            return;
        }

        const player = await this.gameResources.getSoundPlayer(this.soundIndex)

        this.soundPlayer = player;
        this.soundPlayer.play();

    }


    public enableDebug() {
        if (this.game == null) {
            return;
        }

        this.game.setDebugMode(true);
    }

    /** add/subtract one to the current levelIndex */
    public async moveToLevel(moveInterval = 0) {

        this.levelIndex = Math.max(0, (this.levelIndex + moveInterval) | 0);
        
        /// check if the levelIndex is out of bounds
        const config = await this.gameFactory.getConfig(this.gameType);
        if (!config) {
            return;
        }

        /// jump to next level group?
        if (this.levelIndex >= config.level.getGroupLength(this.levelGroupIndex)) {
            this.levelGroupIndex++;
            this.levelIndex = 0;
        }

        /// jump to previous level group?
        if ((this.levelIndex < 0) && (this.levelGroupIndex > 0)) {
            this.levelGroupIndex--;
            this.levelIndex = config.level.getGroupLength(this.levelGroupIndex) - 1;
        }

        /// update and load level
        this.loadLevel();

    }



    /** switch the selected level group */
    public selectLevelGroup(newLevelGroupIndex: number) {
        this.levelGroupIndex = newLevelGroupIndex;

        this.loadLevel();
    }


    /** select a game type */
    public async selectGameType(gameType: GameTypes) {

        const newGameResources = await this.gameFactory.getGameResources(gameType)

        if (!newGameResources) {
            this.log.log('Unable to get game resources');
            return;
        }

        this.gameResources = newGameResources;

        // this.arrayToSelect(this.elementSelectLevelGroup, this.gameResources.getLevelGroups());
        this.levelGroupIndex = 0;

        this.loadLevel();

    }


    /** load a level and render it to the display */
    private async loadLevel() {
        if (!this.gameResources) {
            return;
        }

        if (this.game) {
            this.game.stop();
            this.game = null;
        }

        this.gameState = GameStateTypeHelper.toString(GameStateTypes.UNKNOWN);

        const level = await this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex)
        if (!level) {
            return;
        }

        console.dir(level);
        this.level = level;

        if (!this.stage) {
            return;
        }

        const gameDisplay = this.stage.getGameDisplay();
        gameDisplay.clear();
        this.stage.resetFade();

        level.render(gameDisplay);

        gameDisplay.setScreenPosition(level.screenPositionX, 0);
        gameDisplay.redraw();

    }

}
