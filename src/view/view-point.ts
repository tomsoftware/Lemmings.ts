module Lemmings {

    /** View Point to display the game */
    export class ViewPoint {
        public x;
        public y;
        public scale;

        constructor(x:number, y:number, scale:number) {
            this.x = x;
            this.y = y;
            this.scale = scale;
        }
    }
}