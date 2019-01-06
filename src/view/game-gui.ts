module Lemmings {

export class GameGui {

  private gameTimeChanged:boolean = true;
  private skillsCountChangd:boolean = true;
  private skillSelectionChanged:boolean = true;


  private dispaly: GameDisplay = null;

  public setGuiDisplay(dispaly:GameDisplay) {
      this.dispaly = dispaly;

      this.dispaly.onMouseClick.on((e) => {
        if(e.y > 15) {
          let panelIndex = e.x / 16;
          let newSkill = this.getSkillByPanelIndex(panelIndex);
          if (newSkill == SkillTypes.UNKNOWN) return;

          this.skills.setSelectetSkill(newSkill);
          this.skillSelectionChanged = true;
        }
      });
  }


  constructor(private skillPanelSprites:SkillPanelSprites, private skills:GameSkills, private gameTimer:GameTimer) {

    gameTimer.onGameTick.on(()=> {
        this.gameTimeChanged = true; 
      });

    skills.onCountChanged.on(()=> {
        this.skillsCountChangd = true;
    });

    skills.onSelectionChanged.on(() => {
      this.skillSelectionChanged = true;
    })
  }



  public render() {
    if (this.dispaly == null) return;
    let dispaly = this.dispaly;

    let panelImage = this.skillPanelSprites.getPanelSprite();

    dispaly.initSize(panelImage.width, panelImage.height);

    dispaly.setBackground(panelImage.data);

    this.drawGreenString(dispaly, "Out 1", 112, 0);
    this.drawGreenString(dispaly, "In 0 %", 186, 0);

    if (this.gameTimeChanged) {
      this.gameTimeChanged = false;

      this.renderGameTime(dispaly, 248, 0);
    }
    
    this.drawPanelNumber(dispaly, 88, 1);
    this.drawPanelNumber(dispaly, 77, 2);

    if (this.skillsCountChangd) {
      this.skillsCountChangd = false;

      for(let i = 0; i < SkillTypes.length(); i++) {
        let count = this.skills.getSkill(i);
        
        this.drawPanelNumber(dispaly, count, this.getPanelIndexBySkill(i));
      }

    }
    
    if (this.skillSelectionChanged) {
      this.skillSelectionChanged = false;
      this.drawSelection(dispaly, this.getPanelIndexBySkill(this.skills.getSelectedSkill()));
    }

  }

  
  private getSkillByPanelIndex(panelIndex:number):SkillTypes {
    switch(Math.floor(panelIndex)) {
      case 2: return SkillTypes.CLIMBER;
      case 3: return SkillTypes.FLOATER;
      case 4: return SkillTypes.BOMBER;
      case 5: return SkillTypes.BLOCKER;
      case 6: return SkillTypes.BUILDER;
      case 7: return SkillTypes.BASHER;
      case 8: return SkillTypes.MINER;
      case 9: return SkillTypes.DIGGER;
      default: return SkillTypes.UNKNOWN;
    } 
  }


  private getPanelIndexBySkill(skill:SkillTypes):number {

    switch(skill) {
      case SkillTypes.CLIMBER: return 2;
      case SkillTypes.FLOATER: return 3;
      case SkillTypes.BOMBER: return 4;
      case SkillTypes.BLOCKER: return 5;
      case SkillTypes.BUILDER: return 6;
      case SkillTypes.BASHER: return 7;
      case SkillTypes.MINER: return 8;
      case SkillTypes.DIGGER: return 9;
      default: return -1;
    }
  }


  private drawSelection(dispaly:GameDisplay, panelIndex:number) {

    /// clear selection
    for(let i=2; i<10;i++) {
      if (i == panelIndex) continue;
      dispaly.drawRect(16 * i, 16, 16, 23, 0, 0, 0);
    }
    
    /// draw selection
    dispaly.drawRect(16 * panelIndex, 16, 16, 23, 255, 255, 255);
  }


  private renderGameTime(dispaly:GameDisplay, x: number, y:number) {
    let gameTime = this.gameTimer.getGameLeftTimeString();

    this.drawGreenString(dispaly, "Time "+ gameTime +"-00", x, y);
  }

  private drawPanelNumber(dispaly:GameDisplay, number:number, panelIndex:number) {
    
    this.drawNumber(dispaly, number, 4 + 16 * panelIndex, 17);
  }

  private drawNumber(dispaly:GameDisplay, number:number, x:number, y:number) :number {
    
    let num1Img = this.skillPanelSprites.getNumberSpriteLeft(Math.floor(number / 10));
    let num2Img = this.skillPanelSprites.getNumberSpriteRight(number % 10);

    dispaly.drawFrameCovered(num1Img, x, y, 0, 0, 0);
    dispaly.drawFrame(num2Img, x, y);

    return x + 8;
  }

  /** print out green letters */
  private drawGreenString(dispaly:GameDisplay, text:string, x:number, y:number):number {

    for(let i = 0; i < text.length; i++) {
      let letterImg = this.skillPanelSprites.getLetterSprite(text[i]);

      if (letterImg != null) {
        dispaly.drawFrameCovered(letterImg, x, y, 0,0,0);
      }

      x+= 8;
    }

    return x;
  }
}

}
