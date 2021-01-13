
/** Camera Point to display the game */
export class ViewPoint {
    public x: number;
    public y: number;
    public scale: number;

    constructor(x: number, y: number, scale: number) {
        this.x = x;
        this.y = y;
        this.scale = scale;
    }

    /** transform a X coordinate from display space to game-world space */
    public getSceneX(x: number): number {
        return Math.trunc(x / this.scale) + Math.trunc(this.x);
    }

    /** transform a Y coordinate from display space to game-world space */
    public getSceneY(y: number): number {
        return Math.trunc(y / this.scale) + Math.trunc(this.y);
    }

}
