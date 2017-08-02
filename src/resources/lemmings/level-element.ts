module Lemmings {
  
  /** A LevelElement is a Object / Terrain Item used on a Level map */
  export class LevelElement {
    public x: number = 0;
    public y: number = 0;
    public id: number = 0;
    public frameIndex: number = 0;

    public isUpsideDown: boolean = false;
    public noOverwrite: boolean = false;
    public onlyOverwrite: boolean = false;
    public isErase: boolean = false;
  }

}