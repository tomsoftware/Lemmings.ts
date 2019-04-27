module Lemmings {

    /** manages commands user -> game */
    export class CommandManager {

        private log = new LogHandler("CommandManager");
        private runCommands: { [tick: number]: ICommand } = {};
        private loggedCommads: { [tick: number]: ICommand } = {};

        public constructor(private game: Game, private gameTimer: GameTimer) {

            this.gameTimer.onBeforeGameTick.on((tick: number) => {
                let command = this.runCommands[tick];
                if (!command) return;

                this.queueCommand(command);
            });

        }

        /** load parameters for this command from serializer */
        public loadReplay(replayString: string): void {

            let parts = replayString.split("&");
            for (let i = 0; i < parts.length; i++) {
                let commandStr = parts[i].split("=", 2);
                if (commandStr.length != 2) continue;

                let tick = (+commandStr[0]) | 0;
                this.runCommands[tick] = this.parseCommand(commandStr[1]);
            }
        }

        private commandFactory(type: string): ICommand {
            switch (type.toLowerCase()) {
                case "l":
                    return new CommandLemmingsAction();
                case "n":
                    return new CommandNuke();
                case "s":
                    return new CommandSelectSkill();
                case "i":
                    return new CommandReleaseRateIncrease();
                case "d":
                    return new CommandReleaseRateDecrease();
                default:
                    return null;
            }
        }

        private parseCommand(valuesStr: string): ICommand {
            if (valuesStr.length == 0) return;

            let newCommand = this.commandFactory(valuesStr.substr(0,1));
            let values = valuesStr.substr(1).split(":");

            newCommand.load(values.map(Number));

            return newCommand;
        }

        /** add a command to execute queue */
        public queueCommand(newCommand: ICommand) {
            let currentTick = this.gameTimer.getGameTicks();

            this.loggedCommads[currentTick] = newCommand;

            newCommand.execute(this.game);
        }


        public serialize(): string {
            let result: string[] = [];

            Object.keys(this.loggedCommads).forEach((key) => {
                let command = this.loggedCommads[+key];

                result.push(key + "=" + command.getCommandKey() + command.save().join(":"));

            });

            return result.join("&");

        }

    }
}

