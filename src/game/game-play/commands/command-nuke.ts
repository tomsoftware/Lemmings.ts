import { Game } from '@/game/game';
import { ICommand } from './command';

/** Commands a all lemmings nuke */
export class CommandNuke implements ICommand {

    public getCommandKey(): string {
        return 'n';
    }

    /** load parameters for this command from serializer */
    load(): void {
        // nothing to do
    }

    /** save parameters of this command to serializer */
    save(): number[] {
        return [];
    }

    /** execute this command */
    execute(game: Game): boolean {
        const lemManager = game.getLemmingManager();

        if ((!lemManager) || (lemManager.isNuking())) {
            return false;
        }

        lemManager.doNukeAllLemmings();
        game.getVictoryCondition().doNuke();

        return true;
    }
}

