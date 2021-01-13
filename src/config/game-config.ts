import { GameTypes } from '../game-types';
import { AudioConfig } from './audio-config';
import { LevelConfig } from './level-config';

export class GameConfig {
    /** Name of the Lemmings Game */
    public name: string = '';

    /** Path/Url to the resources */
    public path: string = '';

    /** unique GameType Name */
    public gameType: GameTypes = GameTypes.UNKNOWN;

    public audioConfig: AudioConfig = new AudioConfig();

    public level: LevelConfig = new LevelConfig();


}
