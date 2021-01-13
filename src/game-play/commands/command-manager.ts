import { Game } from '@/game/game';
import { LogHandler } from '@/game/utilities/log-handler';
import { GameTimer } from '../game-timer';
import { ICommand } from './command';
import { CommandLemmingsAction } from './command-lemming-action';
import { CommandNuke } from './command-nuke';
import { CommandReleaseRateDecrease } from './command-release-rate-decrease';
import { CommandReleaseRateIncrease } from './command-release-rate-increase';
import { CommandSelectSkill } from './command-select-skill';

/** manages commands user -> game */
export class CommandManager {

    private log = new LogHandler('CommandManager');
    private runCommands: { [tick: number]: ICommand } = {};
    private loggedCommands: { [tick: number]: ICommand } = {};

    public constructor(private game: Game, private gameTimer: GameTimer) {

        this.gameTimer.onBeforeGameTick.on((tick?: number) => {
            if (!tick) {
                return;
            }

            let command = this.runCommands[tick];
            if (!command) return;

            this.queueCommand(command);
        });

    }

    /** load parameters for this command from serializer */
    public loadReplay(replayString: string): void {

        let parts = replayString.split('&');
        for (let i = 0; i < parts.length; i++) {
            let commandStr = parts[i].split('=', 2);
            if (commandStr.length != 2) continue;

            let tick = (+commandStr[0]) | 0;
            let newCmd = this.parseCommand(commandStr[1]);

            if (newCmd) {
                this.runCommands[tick] = newCmd;
            }
        }
    }

    private commandFactory(type: string): ICommand | null{
        switch (type.toLowerCase()) {
            case 'l':
                return new CommandLemmingsAction();
            case 'n':
                return new CommandNuke();
            case 's':
                return new CommandSelectSkill();
            case 'i':
                return new CommandReleaseRateIncrease();
            case 'd':
                return new CommandReleaseRateDecrease();
            default:
                return null;
        }
    }

    private parseCommand(valuesStr: string): ICommand | null {
        if (valuesStr.length < 1) {
            return null;
        }

        let newCommand = this.commandFactory(valuesStr.substr(0, 1));
        if (!newCommand) {
            return null;
        }

        let values = valuesStr.substr(1).split(':');
        newCommand.load(values.map(Number));

        return newCommand;
    }

    /** add a command to execute queue */
    public queueCommand(newCommand: ICommand) {
        let currentTick = this.gameTimer.getGameTicks();

        if (newCommand.execute(this.game)) {
            // only log commands that are executable
            this.loggedCommands[currentTick] = newCommand;
        }
    }


    public serialize(): string {
        let result: string[] = [];

        Object.keys(this.loggedCommands).forEach((key) => {
            let command = this.loggedCommands[+key];

            result.push(key + '=' + command.getCommandKey() + command.save().join(':'));

        });

        return result.join('&');

    }

}


