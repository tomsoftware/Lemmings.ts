import { Game } from '@/game/game';
import { LogHandler } from '@/game/utilities/log-handler';
import { SkillTypes } from '../skill-types';
import { ICommand } from './command';

/** Commands actions on lemmings the user has given */
export class CommandSelectSkill implements ICommand {

    private skill: SkillTypes;
    private log = new LogHandler('CommandSelectSkill');

    public constructor(skill?: SkillTypes) {
        this.skill = skill || SkillTypes.UNKNOWN;
    }

    public getCommandKey(): string {
        return 's';
    }

    /** load parameters for this command from serializer */
    load(values: number[]): void {
        if (values.length < 0) {
            this.log.log('Unable to process load');
            return;
        }
        this.skill = values[0] as SkillTypes;
    }

    /** save parameters of this command to serializer */
    save(): number[] {
        return [+(this.skill)];
    }

    /** execute this command */
    execute(game: Game): boolean {

        let gameSkill = game.getGameSkills();
        if (!gameSkill) {
            return false;
        }

        return gameSkill.setSelectedSkill(this.skill);
    }
}


