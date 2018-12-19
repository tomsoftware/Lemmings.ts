module Lemmings {

    /** handel the display of the game */
    export class GameDisplay {

        private outputCav: HTMLCanvasElement;
        private processCav: HTMLCanvasElement;
        private viewPoint:ViewPoint = new ViewPoint(0, 0, 1);
        private contentWidth = 0;
        private contentHeight = 0;

        private imgData:ImageData;

        constructor(canvasForOutput: HTMLCanvasElement) {
            this.outputCav = canvasForOutput;
            this.processCav = document.createElement('canvas');
        }


        public setViewPoint(viewPoint:ViewPoint) {
            this.viewPoint = viewPoint;
            this.redraw();
        }


        /** render the level-background to an image */
        public render(level: Level) {
            this.contentWidth = level.width;
            this.contentHeight = level.height;

            this.processCav.width = level.width;
            this.processCav.height = level.height;

            var backCtx = this.processCav.getContext("2d");

            /// create image
            this.imgData = backCtx.createImageData(level.width, level.height);
            /// set pixels
            this.imgData.data.set(level.groundImage);
        }


        /** copys a frame to the display */
        public drawImage(frame:Frame, posX:number, posY:number){
            
            var srcW = frame.width;
            var srcH = frame.height;
            var srcBuffer = frame.data;

            var destW = this.contentWidth;
            var destH = this.contentHeight;
            var destData = this.imgData.data;


            let destX = posX - frame.offsetX;
            let destY = posY - frame.offsetY;

            for (var y = 0; y < srcH; y++) {

                var outY = y + destY;
                if ((outY < 0) || (outY >= destH)) continue;

                for (var x = 0; x < srcW; x++) {
                    let srcIndex = ((srcW * y) + x) * 4;
                    if (srcBuffer[srcIndex + 3] == 0) continue;

                    var outX = x + destX;
                    if ((outX < 0) || (outX >= destW)) continue;

                    let destIndex = ((destW * outY) + outX) * 4;

                    destData[destIndex] = srcBuffer[srcIndex];
                    destData[destIndex + 1] = srcBuffer[srcIndex + 1];
                    destData[destIndex + 2] = srcBuffer[srcIndex + 2];
                    destData[destIndex + 3] = 255; /// Alpha

                }
            }

            this.setDebugPixel(posX, posY);
        }


        public setDebugPixel(x:number, y:number) {
            let i=0;
            let j=0;
            //for(let i=0; i<5;i++)  {
                //for(let j=0; j<5;j++)  {
                    let pointIndex = (this.contentWidth * (y + i) + x + j) * 4;

                    this.imgData.data[pointIndex] = 255;
                    this.imgData.data[pointIndex + 1] = 0;
                    this.imgData.data[pointIndex + 2] = 0;
                    this.imgData.data[pointIndex + 3] = 255; /// Alpha
           //     }
           // }
        }


        /** draw everything to the display */
        public redraw() {

            var backCtx = this.processCav.getContext("2d");

            /// write image to context
            backCtx.putImageData(this.imgData, 0, 0);

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