module Lemmings {

  export enum GameTypes {
    UNKNOWN,
    LEMMINGS,
    OHNO,
    XMAS91,
    XMAS92,
    HOLIDAY93,
    HOLIDAY94
  };

  export module GameTypes {
    export function toString(type: GameTypes):string {
      return GameTypes[type];
    }

    export function length() {
      return 7;
    } 

    export function isValid(type: GameTypes) : boolean {
      return ((type > GameTypes.UNKNOWN) && (type < this.lenght()))
    }


    /** return the GameTypes with the given name */
    export function fromString(typeName: string) : GameTypes {
      typeName = typeName.trim().toUpperCase();

      for(let i=0; i<this.length(); i++) {
        if (GameTypes[i] == typeName) return i;
      }

      return GameTypes.UNKNOWN;
    }
  }
}
