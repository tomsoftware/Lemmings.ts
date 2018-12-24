module Lemmings {

export class GameGui {

  private selectedAction:ActionType;

  public getSelectedAction():ActionType {
    return this.selectedAction;
  }

  constructor(private skillPanelSprites:SkillPanelSprites) {
    this.selectedAction = ActionType.DIGG;
  }

  public render(gameDisplay:GameDisplay) {
    gameDisplay.drawFrame(this.skillPanelSprites.getPanelSprite(), 200, 120);

   // gameDisplay.drawImage();
  }
/*
  this.game = gameObject;

  this.width = 320;
  this.height = 40;

  this.guiCanvas = document.createElement('canvas');
  this.guiCanvas.width  = this.width;
  this.guiCanvas.height = this.height;
  this.guiContext = this.guiCanvas.getContext("2d");

  this.panelImg = null;


  this.letters = null;
  this.skillPos = new Array();

  this.POS_INDEX_RELESERATE_MIN = 0;
  this.POS_INDEX_RELESERATE = 1;

  this.selectedPos = 2;

*/
/*
  private load() {
    var mainFile = self.game.mainFileProvider;

    var fr2 = mainFile.getPart(2);
    var fr6 = mainFile.getPart(6);

    var panel = new ImageSet(self.game.palette.data);
    panel.loadFromFile(fr6, 4, 320, 40, 1);

    self.panelImg = self.guiContext.createImageData(self.width, self.height);
    panel.copyTo(self.panelImg, 0, 0, 0, 200); //- don't use the MaskIndex so set it > 16

    //----------
    //- read number letters
    fr2.setOffset(0x1900);
    this.letters = new ImageSet(self.game.palette.data);
    this.letters.loadFromFile(fr2, 1, 8, 8, 20, 2);

    var SKILL = self.game.SKILL;

    self.skillPos.push({skill:null,          pos:0});
    self.skillPos.push({skill:null,          pos:0});
    self.skillPos.push({skill:SKILL.CLIMBER, pos:0});
    self.skillPos.push({skill:SKILL.FLOATER, pos:0});
    self.skillPos.push({skill:SKILL.BOMBER,  pos:0});
    self.skillPos.push({skill:SKILL.BLOCKER, pos:0});
    self.skillPos.push({skill:SKILL.BUILDER, pos:0});
    self.skillPos.push({skill:SKILL.BASHER,  pos:0});
    self.skillPos.push({skill:SKILL.MINER,   pos:0});
    self.skillPos.push({skill:SKILL.DIGGER,  pos:0});
    self.skillPos.push({skill:null,          pos:0});
    self.skillPos.push({skill:null,          pos:0});

    for (var i = 0; i < self.skillPos.length; i++) {
      self.skillPos[i].pos = 16 * i;
    }

  }


  public render() {
    this.guiContext.putImageData(self.panelImg, 0, 0);

    var skills = self.game.skills;
    var SKILL  = self.game.SKILL;

    for (var i = 0; i < self.skillPos.length; i++)
    {
      if (self.skillPos[i].skill != null) self.printSkill(i);
    }


    self.printNumber(self.game.releaseRateMin, self.skillPos[self.POS_INDEX_RELESERATE_MIN].pos);
    self.printNumber(self.game.releaseRate   , self.skillPos[self.POS_INDEX_RELESERATE].pos);



    var posX = self.skillPos[self.selectedPos].pos;
    self.guiContext.beginPath();
    self.guiContext.strokeStyle = "white";
    self.guiContext.lineWidth = "1";
    self.guiContext.rect(posX + 1.5, 16.5, 14, 23);
    self.guiContext.stroke(); 

    return self.guiCanvas;
  }

  public printSkill(skillIndex)
  {
    var selectedSkill = self.skillPos[skillIndex].skill;
    var value = self.game.levelHandler.skills[selectedSkill.value];
    var x = self.skillPos[skillIndex].pos;

    this.printNumber(value, x);
  }


  public printNumber(value, x)
  {
    var letterImg = self.guiContext.createImageData(8, 8);

    if (value > 0)
    {
      self.letters.copyTo(letterImg, Math.floor(value % 10) * 2 + 0, 0, 0, 200);
    }
    if (Math.floor(value / 10) > 0)
    {
      self.letters.copyTo(letterImg, Math.floor(value / 10) * 2 + 1, 0, 0, 0);
    }
    
    self.guiContext.putImageData(letterImg, x + 4, 17);
  }


  this.onClick = function(x, y)
  {
    if (y > 16)
    {
      //- click on the skills panel
      var pos = Math.floor(x / 16);
      
      switch (pos)
      {
        case 0:
          self.game.decReleaseRate();
          return true;
        case 1:
          self.game.incReleaseRate();
          return true;
        case 10:
          self.game.switchBreak();
          return;
        case 11:
          return;
      }

      if ((pos > 1) && (pos < 10))
      {
        self.selectedPos = pos;
      }
     }
     else
     {
        //- click on the text above the panel
     }

    return false;
  }


  this.removeLemming = function(usedExit)
  {
    if (usedExit)
    {
      self.game.savedCount++;
    }
    else
    {
      self.game.diedCount++;
    }

    if (self.game.releaseCount <= 0)
    {
      if (self.game.releasedCount <= self.game.savedCount + self.game.diedCount)
      {
        //- no more Lemmings left
        self.game.isGameOver = true;
      }
    }
  }


  this.onClickLemming = function(lemmingIndex)
  {
    var lem = self.game.lemmings[lemmingIndex];

    var selectedSkill = self.skillPos[self.selectedPos].skill;
    if (selectedSkill == null) return;


    var SKILL = self.game.SKILL;

    switch (selectedSkill)
    {
      case SKILL.CLIMBER:
        if (!lem.canClimb) lem.canClimb = true;
        break;
      case SKILL.FLOATER:
        if (!lem.hasUmbrella) lem.hasUmbrella = true;
        break;
      case SKILL.BOMBER:
        lem.changeState(lem.STATE.BOMBING);
        break;
      case SKILL.BLOCKER:
        lem.changeState(lem.STATE.BLOCKING );
        break;
      case SKILL.BUILDER:
        lem.changeState(lem.STATE.BUILDING);
        break;
      case SKILL.BASHER:
        lem.changeState(lem.STATE.BASHING);
        break;
      case SKILL.MINER:
        lem.changeState(lem.STATE.MINING);
        break;
      case SKILL.DIGGER:
        lem.changeState(lem.STATE.DIGGING);
        break;
    }   

  }
*/
}

}
