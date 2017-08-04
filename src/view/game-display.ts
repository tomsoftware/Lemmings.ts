module Lemmings {

    /** handel the display of the game */
    export class GameDisplay {

        private outputCav: HTMLCanvasElement;
        private processCav: HTMLCanvasElement;
        private viewPoint:ViewPoint = new ViewPoint(0, 0, 1);
        private contentWidth = 0;
        private contentHeight = 0;

        constructor(canvasForOutput: HTMLCanvasElement) {
            this.outputCav = canvasForOutput;
            this.processCav = document.createElement('canvas');
        }


        public setViewPoint(viewPoint:ViewPoint) {
            this.viewPoint = viewPoint;
            this.redraw();
        }


        public render(level: Level) {
            this.contentWidth = level.width;
            this.contentHeight = level.height;

            this.processCav.width = level.width;
            this.processCav.height = level.height;

            var backCtx = this.processCav.getContext("2d");

            /// create image
            var imgData = backCtx.createImageData(level.width, level.height);
            /// set pixels
            imgData.data.set(level.groundImage);
            /// write image to context
            backCtx.putImageData(imgData, 0, 0);

            this.redraw();
        }


        public redraw() {

            var cav: HTMLCanvasElement = this.outputCav;
            var ctx = cav.getContext("2d");

            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;
        


            let outGameH = cav.height;
            let outW = cav.width;


            let viewScale = this.viewPoint.scale;
            let viewX = this.viewPoint.x;
            let viewY = this.viewPoint.y;

            //- Display Layers
            var dW = this.contentWidth - viewX; //- display width
            if ((dW * viewScale) > outW) {
                dW = outW / viewScale;
                //game.viewScale = outW / dW;
            }

            var dH = this.contentHeight - viewY; //- display height
            if ((dH * viewScale) > outGameH) {
                dH = outGameH / viewScale;
                //game.viewScale = outH / dH;
            }



            //- drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)
            ctx.drawImage(this.processCav, viewX, viewY, dW, dH, 0, 0, dW * viewScale, dH * viewScale);

        }
    }
}