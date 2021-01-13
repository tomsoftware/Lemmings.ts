import { Level } from '../resources/level';
import { EventHandler } from '../utilities/event-handler';
import { SkillTypes } from './skill-types';

export class GameSkills {
    private skills: SkillTypes[];
    private selectedSkill: SkillTypes = SkillTypes.CLIMBER;

    constructor(level: Level) {
        this.skills = level.skills;
    }

    public onCountChanged = new EventHandler<SkillTypes>();

    /** return true if the skill can be reduced / used */
    public canDecreaseSkill(type: SkillTypes): boolean {
        return (this.skills[type] > 0);
    }


    public decreaseSkill(type: SkillTypes): boolean {
        if (this.skills[type] <= 0) {
            return false;
        }

        this.skills[type]--;
        this.onCountChanged.trigger(type);

        return true;
    }

    public getSkill(type: SkillTypes) {
        if (!SkillTypes.isValid(type)) return 0;

        return this.skills[type];
    }

    public getSelectedSkill(): SkillTypes {
        return this.selectedSkill;
    }

    public onSelectionChanged = new EventHandler<SkillTypes>();

    public setSelectedSkill(skill: SkillTypes): boolean {
        if (this.selectedSkill == skill) {
            return false;
        }

        if (!SkillTypes.isValid(skill)) {
            return false;
        }

        this.selectedSkill = skill;
        this.onSelectionChanged.trigger();

        return true;
    }

    /** increase the amount of actions for all skills */
    public cheat() {
        for (let i = 0; i < this.skills.length; i++) {
            this.skills[i] = 99;
            this.onCountChanged.trigger(i);
        }
    }

}
