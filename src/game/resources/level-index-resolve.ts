import { GameConfig } from '../config/game-config';


export class LevelIndexType {
  /** Number of the file */
  public fileId: number = 0;

  /** container index in the file */
  public partIndex: number = 0;

  /** use the odd table information for this entry */
  public useOddTable: boolean = false;

  /** the number of this level - starting with 0 and counting every level */
  public levelNumber: number = 0;
}


/** matches the Level-Mode + Level-Index to a level-file and level-file-index */
export class LevelIndexResolve {

  constructor(private config: GameConfig) {

  }


  public resolve(levelMode: number, levelIndex: number): LevelIndexType | null {

    let levelOrderList = this.config.level.order;
    if (levelOrderList.length <= levelMode) {
      return null;
    }
    if (levelMode < 0) {
      return null;
    }

    let levelOrder = levelOrderList[levelMode];
    if (levelOrder.length <= levelIndex) {
      return null;
    }
    if (levelIndex < 0) {
      return null;
    }

    let levelOrderConfig = levelOrder[levelIndex];

    let liType = new LevelIndexType();

    liType.fileId = Math.abs((levelOrderConfig / 10) | 0);
    liType.partIndex = Math.abs((levelOrderConfig % 10) | 0);
    liType.useOddTable = (levelOrderConfig < 0);

    /// the level number is the sum-index of the level
    let levelNo = 0;
    for (let i = 0; i < (levelMode - 1); i++) {
      levelNo += levelOrderList[i].length;
    }

    liType.levelNumber = levelNo + levelIndex;


    return liType;
  }
}

