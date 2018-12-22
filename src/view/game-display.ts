module Lemmings {

    /** handel the display of the game */
    export class GameDisplay {

        private outputCav: HTMLCanvasElement;
        private outputCtx: CanvasRenderingContext2D;
        private processCav: HTMLCanvasElement;
        private processCtx: CanvasRenderingContext2D;
        private viewPoint:ViewPoint = new ViewPoint(0, 0, 1);
        private contentWidth = 0;
        private contentHeight = 0;

        private imgData:ImageData;

        constructor(canvasForOutput: HTMLCanvasElement) {
            this.outputCav = canvasForOutput;
            this.processCav = document.createElement('canvas');
            this.clear();
        }


        public setViewPoint(viewPoint:ViewPoint) {
            this.viewPoint = viewPoint;

            this.clear();
            this.redraw();
        }

        public clear() {
            var ctx = this.outputCav.getContext("2d");
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }


        public initRender(width:number, height:number) {
            /// create image data
            if ((this.contentWidth != width) || (this.contentHeight != height)) {
                this.contentWidth = width;
                this.contentHeight = height;

                this.processCav.width = width;
                this.processCav.height = height;

                this.processCtx = this.processCav.getContext("2d");

                /// create image
                this.imgData = this.processCtx.createImageData(width, height);
            }
        }


        /** render the level-background to an image */
        public setBackground(groundImage: Uint8ClampedArray) {

            /// set pixels
            this.imgData.data.set(groundImage);
        }


        public drawImage(imageDate: Uint8ClampedArray, width:number, height:number, posX:number, posY:number) {
  
            var DAT = new ImageData(imageDate, width, height);
            this.processCtx.putImageData( DAT , posX, posY );
        }


        /** copys a frame to the display */
        public drawFrame(frame:Frame, posX:number, posY:number){
         //   var UAC = new Uint8ClampedArray( frame.data, frame.width, frame.height);
         //   this.drawImage(UAC, frame.width, frame.height, posX - frame.offsetX, posY - frame.offsetY);
         //   return;
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
                }
            }

            this.setDebugPixel(posX, posY);
        }


        public setDebugPixel(x:number, y:number) {
            let pointIndex = (this.contentWidth * (y) + x) * 4;

            this.imgData.data[pointIndex] = 255;
            this.imgData.data[pointIndex + 1] = 0;
            this.imgData.data[pointIndex + 2] = 0;
        }


        /** draw everything to the display */
        public redraw() {

            /// write image to context
            this.processCtx.putImageData(this.imgData, 0, 0);

            if (this.outputCtx == null) {
                this.outputCtx = this.outputCav.getContext("2d");
            }
            let ctx = this.outputCtx;

            //@ts-ignore
            ctx.mozImageSmoothingEnabled = false;
            //@ts-ignore
            ctx.webkitImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;

            let outGameH = ctx.canvas.height;
            let outW = ctx.canvas.width;

            let viewScale = this.viewPoint.scale;
            let viewX = this.viewPoint.x;
            let viewY = this.viewPoint.y;

            //- Display Layers
            var dW = this.contentWidth - viewX; //- display width
            if ((dW * viewScale) > outW) {
                dW = outW / viewScale;
            }

            var dH = this.contentHeight - viewY; //- display height
            if ((dH * viewScale) > outGameH) {
                dH = outGameH / viewScale;
            }

            //- drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)
            ctx.drawImage(this.processCav, viewX, viewY, dW, dH, 0, 0, dW * viewScale, dH * viewScale);

        }
    }
}