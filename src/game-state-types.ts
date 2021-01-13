export enum GameStateTypes {
  UNKNOWN,
  RUNNING,
  FAILED_OUT_OF_TIME,
  FAILED_LESS_LEMMINGS,
  SUCCEEDED
};

export class GameStateTypeHelper {
  public static toString(type: GameStateTypes): string {
    return GameStateTypes[type];
  }

  public static count() {
    return 5;
  }

  public static isValid(type: GameStateTypes): boolean {
    return ((type > GameStateTypes.UNKNOWN) && (type < GameStateTypeHelper.count()))
  }


  /** return the GameStateTypes with the given name */
  public static fromString(typeName: string): GameStateTypes {
    typeName = typeName.trim().toUpperCase();

    for (let i = 0; i < GameStateTypeHelper.count(); i++) {
      if (GameStateTypes[i] == typeName) return i;
    }

    return GameStateTypes.UNKNOWN;
  }
}

