module Lemmings {

    /** handel the display of the game */
    export class GameDisplay {

        private imgData:ContextImage;

        constructor(private stage: Stage) {
        }



        public initRender(width:number, height:number) {
            /// create image data
            if ((this.imgData == null) || (this.imgData.width != width) || (this.imgData.height != height)) {
                this.imgData = this.stage.createImage(width, height)   
            }
        }


        /** render the level-background to an image */
        public setBackground(groundImage: Uint8ClampedArray) {

            /// set pixels
            this.imgData.data.set(groundImage);
        }


        /** copys a frame to the display */
        public drawFrame(frame:Frame, posX:number, posY:number){

            let srcW = frame.width;
            let srcH = frame.height;
            let srcBuffer = frame.data;

            let destW = this.imgData.width;
            let destH = this.imgData.height;
            let destData = this.imgData.data;


            let destX = posX - frame.offsetX;
            let destY = posY - frame.offsetY;

            for (let y = 0; y < srcH; y++) {

                let outY = y + destY;
                if ((outY < 0) || (outY >= destH)) continue;

                for (let x = 0; x < srcW; x++) {
                    let srcIndex = ((srcW * y) + x) * 4;
                    if (srcBuffer[srcIndex + 3] == 0) continue;

                    let outX = x + destX;
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
            let pointIndex = (this.imgData.width * (y) + x) * 4;

            this.imgData.data[pointIndex] = 255;
            this.imgData.data[pointIndex + 1] = 0;
            this.imgData.data[pointIndex + 2] = 0;
        }

        public getImageData(): ContextImage {
            return this.imgData;
        }

        public redraw() {
            this.stage.redraw();
        }
    }
}