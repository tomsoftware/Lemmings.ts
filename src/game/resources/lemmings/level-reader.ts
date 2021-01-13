import { SkillTypes } from '@/game/game-play/skill-types';
import { LogHandler } from '@/game/utilities/log-handler';
import { DrawProperties } from '../draw-properties';
import { BinaryReader } from '../file/binary-reader';
import { LevelElement } from './level-element';
import { LevelProperties } from './level-properties';
import { Rectangle } from './rectangle';

/** read a level from LEVEL___.DAT file */
export class LevelReader {

  public levelWidth = 1600;
  public levelHeight = 160;

  public levelProperties: LevelProperties = new LevelProperties();

  public screenPositionX = 0;

  /** index of GROUNDxO.DAT file */
  public graphicSet1 = 0;
  /** index of VGASPECx.DAT */
  public graphicSet2 = 0;

  public isSuperLemming = false;

  public objects: LevelElement[] = [];
  public terrains: LevelElement[] = [];
  public steel: Rectangle[] = [];

  private log = new LogHandler("LevelReader");

  /// Load a Level
  constructor(fr: BinaryReader) {

    this.readLevelInfo(fr);
    this.readLevelObjects(fr);
    this.readLevelTerrain(fr);
    this.readSteelArea(fr);
    this.readLevelName(fr);

    this.log.debug(this);
  }


  /** read general Level information */
  private readLevelInfo(fr: BinaryReader) {

    fr.setOffset(0);

    this.levelProperties.releaseRate = fr.readWord();
    this.levelProperties.releaseCount = fr.readWord();
    this.levelProperties.needCount = fr.readWord();
    this.levelProperties.timeLimit = fr.readWord();

    //- read amount of skills
    this.levelProperties.skills[SkillTypes.CLIMBER] = fr.readWord();
    this.levelProperties.skills[SkillTypes.FLOATER] = fr.readWord();
    this.levelProperties.skills[SkillTypes.BOMBER] = fr.readWord();
    this.levelProperties.skills[SkillTypes.BLOCKER] = fr.readWord();
    this.levelProperties.skills[SkillTypes.BUILDER] = fr.readWord();
    this.levelProperties.skills[SkillTypes.BASHER] = fr.readWord();
    this.levelProperties.skills[SkillTypes.MINER] = fr.readWord();
    this.levelProperties.skills[SkillTypes.DIGGER] = fr.readWord();

    this.screenPositionX = fr.readWord();

    this.graphicSet1 = fr.readWord();
    this.graphicSet2 = fr.readWord();

    this.isSuperLemming = (fr.readWord() != 0);
  }


  /** read the level objects */
  private readLevelObjects(fr: BinaryReader) {

    /// reset array
    this.objects = [];

    fr.setOffset(0x0020);

    for (let i = 0; i < 32; i++) {

      const x = fr.readWord() - 16;
      const y = fr.readWord();
      const id = fr.readWord();

      const flags = fr.readWord();
      const isUpsideDown = ((flags & 0x0080) > 0);
      const noOverwrite = ((flags & 0x8000) > 0);
      const onlyOverwrite = ((flags & 0x4000) > 0);

      /// ignore empty items/objects
      if (flags == 0) {
        continue;
      }

      const drawProperties = new DrawProperties(isUpsideDown, noOverwrite, onlyOverwrite, false);

      this.objects.push(new LevelElement(x, y, id, drawProperties));
    }
  }


  /** read the Level Objects */
  private readLevelTerrain(fr: BinaryReader) {

    /// reset array
    this.terrains = [];

    fr.setOffset(0x0120);

    for (let i = 0; i < 400; i++) {

      const v = fr.readInt(4);
      if (v == -1) {
        continue;
      }

      const x = ((v >> 16) & 0x0FFF) - 16;

      const yValue = ((v >> 7) & 0x01FF);
      const y = yValue - ((yValue > 256) ? 516 : 4);

      const id = (v & 0x003F);

      const flags = ((v >> 29) & 0x000F);
      const isUpsideDown = ((flags & 2) > 0);
      const noOverwrite = ((flags & 4) > 0);
      const isErase = ((flags & 1) > 0);

      const drawProperties = new DrawProperties(isUpsideDown, noOverwrite, false, isErase);

      this.terrains.push(new LevelElement(x, y, id, drawProperties));
    }
  }


  /** read Level Steel areas (Lemming can't pass) */
  private readSteelArea(fr: BinaryReader) {

    /// reset array
    this.steel = [];

    fr.setOffset(0x0760);

    for (let i = 0; i < 32; i++) {
      const newRange = new Rectangle();

      const pos = fr.readWord();
      const size = fr.readByte();
      const unknown = fr.readByte();

      if ((pos == 0) && (size == 0)) {
        continue;
      }

      if (unknown != 0) {
        this.log.log('Error in readSteelArea() : unknown != 0');
        continue;
      }

      newRange.x = (pos & 0x01FF) * 4 - 16;
      newRange.y = ((pos >> 9) & 0x007F) * 4;

      newRange.width = (size & 0x0F) * 4 + 4;
      newRange.height = ((size >> 4) & 0x0F) * 4 + 4;

      this.steel.push(newRange);
    }
  }


  /** read general Level information */
  private readLevelName(fr: BinaryReader) {
    /// at the end of the 
    this.levelProperties.levelName = fr.readString(32, 0x07E0);
    this.log.debug("Level Name: " + this.levelProperties.levelName);
  }

}

