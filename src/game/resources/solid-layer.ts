
/** Handles a mask of points for the level background
 *   that defines the solid points of the level */
export class SolidLayer {

    /** the background mask 0=noGround / 1=ground*/
    private groundMask?: Int8Array;

    public width = 0;
    public height = 0;


    /** check if a point is solid */
    public hasGroundAt(x: number, y: number): boolean {
        if (!this.groundMask) {
            return false;
        }

        if ((x < 0) || (x >= this.width)) {
            return false;
        }

        if ((y < 0) || (y >= this.height)) {
            return false;
        }

        return (this.groundMask[x + y * this.width] != 0);
    }

    /** clear a point  */
    public clearGroundAt(x: number, y: number) {
        if (!this.groundMask) {
            return false;
        }

        let index = x + y * this.width;

        this.groundMask[index] = 0;
    }

    /** clear a point  */
    public setGroundAt(x: number, y: number) {
        if (!this.groundMask) {
            return false;
        }
        
        let index = x + y * this.width;

        this.groundMask[index] = 1;
    }

    constructor(width: number, height: number, mask?: Int8Array) {
        this.width = width;
        this.height = height;
        this.groundMask = mask;
    }

}


