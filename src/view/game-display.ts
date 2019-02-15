module Lemmings {

    export class GameDisplay {

        private dispaly: DisplayImage = null;

        public setGuiDisplay(dispaly: DisplayImage) {
            this.dispaly = dispaly;

            this.dispaly.onMouseClick.on((e) => {
                let lem = this.lemmingManager.getLemmingAt(e.x, e.y);
                if (lem == null) return;

                let selectedSkill = this.gameSkills.getSelectedSkill();

                if (this.gameSkills.canReduseSkill(selectedSkill) || (true)) {
                    /// set the skill
                    if (this.lemmingManager.doLemmingAction(lem, selectedSkill)) {
                        /// reduce the available skill count
                        this.gameSkills.reduseSkill(selectedSkill)
                    }  
                }

            });
        }


        constructor(
            private gameSkills: GameSkills,
            private level: Level,
            private lemmingManager: LemmingManager,
            private objectManager: ObjectManager, 
            private triggerManager: TriggerManager) {
        }


        public render() {
            if (this.dispaly == null) return;

            this.level.render(this.dispaly);

            this.objectManager.render(this.dispaly);

            this.lemmingManager.render(this.dispaly);

            this.triggerManager.render(this.dispaly);
            
            //this.dispaly.redraw();
        }

    }
}
