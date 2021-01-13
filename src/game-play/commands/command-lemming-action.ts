import { Game } from '@/game/game';
import { LogHandler } from '@/game/utilities/log-handler';
import { ICommand } from './command';

    /** Commands actions on lemmings the user has given */
    export class CommandLemmingsAction implements ICommand {

        private lemmingId: number;
        private log = new LogHandler('CommandLemmingsAction');

        public constructor(lemmingId: number = 0) {
            this.lemmingId = lemmingId;
        }

        public getCommandKey(): string {
            return 'l';
        }

        /** load parameters for this command from serializer */
        load(values: number[]): void {
            if (values.length < 1) {
                this.log.log('Unable to process load');
                return;
            }
            this.lemmingId = values[0];
        }

        /** save parameters of this command to serializer */
        save(): number[] {
            return [this.lemmingId];
        }

        /** execute this command */
        execute(game: Game): boolean {

            let lemManager = game.getLemmingManager();
            let lem = lemManager.getLemming(this.lemmingId);

            if (!lem) {
                this.log.log('Lemming not found! ' + this.lemmingId);
                return false;
            }

            let skills = game.getGameSkills();
            let selectedSkill = skills.getSelectedSkill();

            if (!skills.canDecreaseSkill(selectedSkill)) {
                this.log.log('Not enough skills!');
                return false;
            }


            /// set the skill
            if (!lemManager.doLemmingAction(lem, selectedSkill)) {
                this.log.log('unable to execute action on lemming!');
                return false;
            }

            /// reduce the available skill count
            return skills.decreaseSkill(selectedSkill);

        }
    }


