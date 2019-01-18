module Lemmings {

    export class GameDisplay {
    
      private dispaly: DisplayImage = null;
    
      public setGuiDisplay(dispaly:DisplayImage) {
          this.dispaly = dispaly;
    
          this.dispaly.onMouseClick.on((e) => {
            let lem = this.lemmingManager.getLemmingAt(e.x, e.y);
            if (lem == null) return;
            
            let selectedSkill = this.gameSkills.getSelectedSkill();
            if (this.gameSkills.reduseSkill(selectedSkill)) {
                this.lemmingManager.setLemmingAction(lem, ActionType.DIGG);
            }
            
          });
      }
    
    
      constructor(
          private gameSkills:GameSkills,
          private level:Level,
          private lemmingManager:LemmingManager,
          private objectManager:ObjectManager) {
    
      }
    
    
    
      public render() {
        if (this.dispaly == null) return;
    
        this.level.render(this.dispaly);

        this.objectManager.render(this.dispaly);

        this.lemmingManager.render(this.dispaly);
        
        //this.dispaly.redraw();
    
      }
    
    
    
    }
}
    