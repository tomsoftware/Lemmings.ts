export class Rectangle {
    /** X position in the container */
    public x1:number = 0;
    /** Y position in the container */
    public y1:number = 0;

    /** X position in the container */
    public x2:number = 0;
    /** Y position in the container */
    public y2:number = 0;

    constructor(x1:number = 0, y1:number = 0,x2:number = 0, y2:number = 0) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
} 
