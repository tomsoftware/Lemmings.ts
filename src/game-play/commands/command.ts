import { Game } from '@/game/game';

/** Commands provide actions the user has given */
export interface ICommand {

    /** load parameters for this command from serializer */
    load(values: number[]): void;

    /** save parameters of this command to serializer */
    save(): number[];

    /** execute this command */
    execute(game: Game): boolean;

    getCommandKey(): string;
}

