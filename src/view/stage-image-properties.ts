module Lemmings {

	export class StageImageProperties {
        public ctx: CanvasRenderingContext2D;
        public cav: HTMLCanvasElement;
        /** X position to display this Image */
        public x:number = 0;
        /** Y position to display this Image */
        public y:number = 0;

        public width:number = 0;
        public height:number = 0;

        public display : DisplayImage = null;
        public viewPoint: ViewPoint = new ViewPoint(0, 0, 1);

        public createImage(width:number, height:number) {
            this.cav = document.createElement('canvas');

            this.cav.width = width;
            this.cav.height = height;

            this.ctx = this.cav.getContext("2d");

            return this.ctx.createImageData(width, height);
        }
    }
	
}