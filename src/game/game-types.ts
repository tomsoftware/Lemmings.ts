export enum GameTypes {
  UNKNOWN,
  LEMMINGS,
  OHNO,
  XMAS91,
  XMAS92,
  HOLIDAY93,
  HOLIDAY94
};

export class GameTypesHelper {
  public static toString(type: GameTypes): string {
    return GameTypes[type];
  }

  public static count() {
    return 7;
  }

  public static isValid(type: GameTypes): boolean {
    return ((type > GameTypes.UNKNOWN) && (type < GameTypesHelper.count()))
  }


  /** return the GameTypes with the given name */
  public static fromString(typeName: string): GameTypes {
    typeName = typeName.trim().toUpperCase();

    for (let i = 0; i < GameTypesHelper.count(); i++) {
      if (GameTypes[i] == typeName) {
        return i;
      }
    }

    return GameTypes.UNKNOWN;
  }
}
