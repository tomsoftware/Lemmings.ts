import { Game } from './game';
import { GameStateTypes } from './game-state-types';

/** collects all information about the finished game */
export class GameResult {
    public survivorPercentage: number;
    public survivors: number;
    public state: GameStateTypes;
    public replay: string;
    public duration: number;

    constructor(game: Game) {
        this.state = game.getGameState();
        this.replay = game.getCommandManager().serialize();
        this.survivorPercentage = game.getVictoryCondition().getSurvivorPercentage();
        this.survivors = game.getVictoryCondition().getSurvivorsCount();
        this.duration = game.getGameTimer().getGameTicks();
    }
}
