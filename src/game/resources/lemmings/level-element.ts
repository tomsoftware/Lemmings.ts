import { DrawProperties } from '../draw-properties';

/** A LevelElement is a Object / Terrain Item used on a Level map */
export class LevelElement {
  public x: number;
  public y: number;
  public id: number;
  public frameIndex: number = 0;

  public drawProperties: DrawProperties;

  public constructor(
    x: number,
    y: number,
    id: number,
    drawProperties: DrawProperties) {

    this.x = x;
    this.y = y;
    this.id = id;
    this.drawProperties = drawProperties;
  }
}
