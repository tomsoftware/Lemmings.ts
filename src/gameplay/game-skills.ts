module Lemmings {

    export class GameSkills {
        private skills:SkillTypes[];
        private selectedSkill:SkillTypes = SkillTypes.CLIMBER;

        constructor(level:Level) {
            this.skills = level.skills;
        }

        public onCountChanged = new EventHandler<SkillTypes>();

        public reduseSkill(type:SkillTypes) {
            this.skills[type]--;
            this.onCountChanged.trigger(type);
        }

        public getSkill(type:SkillTypes) {
            if (!SkillTypes.isValid(type)) return 0;
            
            return this.skills[type];
        }

        public getSelectedSkill():SkillTypes {
            return this.selectedSkill;
        }

        public onSelectionChanged = new EventHandler<SkillTypes>();

        public setSelectetSkill(skill: SkillTypes) {
            this.selectedSkill = skill;
            this.onSelectionChanged.trigger();
        }

    }
}