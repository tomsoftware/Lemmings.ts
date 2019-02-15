module Lemmings {

    export class GameSkills {
        private skills:SkillTypes[];
        private selectedSkill:SkillTypes = SkillTypes.CLIMBER;

        constructor(level:Level) {
            this.skills = level.skills;
        }

        public onCountChanged = new EventHandler<SkillTypes>();
        
        /** return true if the skill can be redused / used */
        public canReduseSkill(type:SkillTypes):boolean {
            return (this.skills[type] <= 0);
        }


        public reduseSkill(type:SkillTypes):boolean {
            if (this.skills[type] <= 0) return false;

            this.skills[type]--;
            this.onCountChanged.trigger(type);

            return true;
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