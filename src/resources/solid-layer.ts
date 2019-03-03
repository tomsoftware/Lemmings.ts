
module Lemmings {

    /** Handels a mask of points for the level background
     *   that defines the solid points of the level */
    export class SolidLayer {

        /** the background mask 0=noGround / 1=ground*/
        private groundMask: Int8Array;

        public width = 1600;
        public height = 160;


        /** check if a point is solid */
        public hasGroundAt(x: number, y: number): boolean {
            if ((x < 0) || (x >= this.width)) return false;
            if ((y < 0) || (y >= this.height)) return false;

            return (this.groundMask[x + y * this.width] != 0);
        }

        /** clear a point  */
        public clearGroundAt(x: number, y: number) {
            let index = x + y * this.width;

            this.groundMask[index] = 0;
        }

        /** clear a point  */
        public setGroundAt(x: number, y: number) {
            let index = x + y * this.width;

            this.groundMask[index] = 1;
        }

        constructor(width: number, height: number, mask: Int8Array=null) {
            this.width = width;
            this.height = height;

            if (mask != null) {
                this.groundMask = mask;
            }
            else {
                //this.groundMask = new Int8Array(width * height);
            }

        }

    }

}
