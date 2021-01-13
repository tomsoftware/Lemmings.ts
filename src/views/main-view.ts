import { Options, Vue } from 'vue-class-component';
import { LogHandler } from '@/game/utilities/log-handler';
import { GameTypes, GameTypesHelper } from '@/game/game-types';
import { GameResources } from '@/game/game-resources';
import { GameFactory } from '@/game/game-factory';


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
export default class MainView extends Vue {
    private log: LogHandler = new LogHandler('DebugView');

    private levelIndex = 0;
    private levelGroupIndex = 0;
    private gameType: GameTypes = GameTypes.LEMMINGS;
    private gameResources: GameResources | null = null;
    private gameFactory = new GameFactory('./data');
    public gameState = '';

    protected backgroundImage = '';
    protected logo = '';
    protected f1 = '';
    protected f2 = '';
    protected f3 = '';
    protected f4 = '';
    protected fx = '';
    protected music = '';
    protected exit = '';
    protected rate = '';

    protected leftScroll = '';
    protected rightScroll = '';
    protected reel = '';

    public mounted() {

        this.levelIndex = 0;
        this.levelGroupIndex = 0;
        this.gameType = GameTypes.LEMMINGS;

        this.log.log('selected level: ' + GameTypesHelper.toString(this.gameType) + ' : ' + this.levelIndex + ' / ' + this.levelGroupIndex);

        this.selectGameType();
    }


    /** switch the selected level group */
    public selectLevelGroup(newLevelGroupIndex: number) {
        this.levelGroupIndex = newLevelGroupIndex;

        this.showStartView();
    }


    /** select a game type */
    public async selectGameType(moveValue = 0) {

        this.gameType = (GameTypesHelper.count() + this.gameType + moveValue) % GameTypesHelper.count();
        
        this.log.log('game type: ' + this.gameType);

        const newGameResources = await this.gameFactory.getGameResources(this.gameType);

        if (!newGameResources) {
            this.log.log('Unable to get game resources');
            return;
        }

        this.gameResources = newGameResources;

        // this.arrayToSelect(this.elementSelectLevelGroup, this.gameResources.getLevelGroups());
        this.levelGroupIndex = 0;

        this.showStartView();

    }


    /** load a level and render it to the display */
    private async showStartView() {
        if (!this.gameResources) {
            return;
        }

        const images = await this.gameResources.getMainImageSprites();

        this.backgroundImage = images.getBackground().getImageUrl();
        this.logo = images.getLogo().getImage();
        this.f1 = images.getF1().getImage();
        this.f2 = images.getF2().getImage();
        this.f3 = images.getF3().getImage();
        this.f4 = images.getF4().getImage();

        this.fx = images.getFxIcon().getImage();
        this.music = images.getMusicIcon().getImage();
        this.exit = images.getExit().getImage();
        this.rate = images.getLevelRating().getImage();

        this.leftScroll = images.getLeftScroll().getImage();
        this.rightScroll = images.getRightScroll().getImage();

        this.reel = images.getReel().getImageUrl();
    }

}
