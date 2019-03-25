module Lemmings {

    export enum GameStateTypes {
      UNKNOWN,
      RUNNING,
      FAILED_OUT_OF_TIME,
      FAILED_LESS_LEMMINGS,
      SUCCEEDED
    };

    export module GameStateTypes {
      export function toString(type: GameStateTypes):string {
        return GameStateTypes[type];
      }
  
      export function length() {
        return 5;
      } 
  
      export function isValid(type: GameStateTypes) : boolean {
        return ((type > GameStateTypes.UNKNOWN) && (type < this.lenght()))
      }
  
  
      /** return the GameStateTypes with the given name */
      export function fromString(typeName: string) : GameStateTypes {
        typeName = typeName.trim().toUpperCase();
  
        for(let i=0; i<this.length(); i++) {
          if (GameStateTypes[i] == typeName) return i;
        }
  
        return GameStateTypes.UNKNOWN;
      }
    }
  }
  