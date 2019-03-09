module Lemmings {

    /** handel the display of the game images */
    export class DisplayImage {

        private imgData: ImageData;
        private groundMask: SolidLayer;

        public getWidth(): number {
            if (this.imgData == null) return 0;
            return this.imgData.width;
        }
        public getHeight(): number {
            if (this.imgData == null) return 0;
            return this.imgData.height;
        }

        constructor(private stage: Stage) {
        }

        public onMouseClick = new EventHandler<Position2D>();
        public onMouseMove = new EventHandler<Position2D>();

        public initSize(width: number, height: number) {
            /// create image data
            if ((this.imgData == null) || (this.imgData.width != width) || (this.imgData.height != height)) {
                this.imgData = this.stage.createImage(this, width, height);

                this.clear();
            }
        }

        public clear() {
            if (this.imgData == null) return;

            let img = new Uint32Array(this.imgData.data);

            for (let i = 0; i < img.length; i++) {
                img[i] = 0xFF00FF00;
            }
        }


        /** render the level-background to an image */
        public setBackground(groundImage: Uint8ClampedArray, groundMask: SolidLayer = null) {
            /// set pixels
            this.imgData.data.set(groundImage);
            this.groundMask = groundMask;
        }


        private uint8ClampedColor(colorValue: number): number {
            return colorValue & 0xFF;
        }

        public drawRectangle(rect: Rectangle, red: number, green: number, blue: number) {
            this.drawHorizontalLine(rect.x1, rect.y1, rect.x2, red, green, blue);
            this.drawHorizontalLine(rect.x1, rect.y2, rect.x2, red, green, blue);
            this.drawVerticalLine(rect.x1, rect.y1, rect.y2, red, green, blue);
            this.drawVerticalLine(rect.x2, rect.y1, rect.y2, red, green, blue);
        }

        /** draw a rect to the display */
        public drawRect(x: number, y: number, width: number, height: number, red: number, green: number, blue: number) {

            let x2 = x + width;
            let y2 = y + height;

            this.drawHorizontalLine(x, y, x2, red, green, blue);
            this.drawHorizontalLine(x, y2, x2, red, green, blue);
            this.drawVerticalLine(x, y, y2, red, green, blue);
            this.drawVerticalLine(x2, y, y2, red, green, blue);

        }

        public drawVerticalLine(x1: number, y1: number, y2: number, red: number, green: number, blue: number) {
            red = this.uint8ClampedColor(red);
            green = this.uint8ClampedColor(green);
            blue = this.uint8ClampedColor(blue);

            let destW = this.imgData.width;
            let destH = this.imgData.height;
            let destData = this.imgData.data;

            x1 = (x1 >= destW) ? (destW - 1) : (x1 < 0) ? 0 : x1;
            y1 = (y1 >= destH) ? (destH - 1) : (y1 < 0) ? 0 : y1;
            y2 = (y2 >= destH) ? (destH - 1) : (y2 < 0) ? 0 : y2;

            for (let y = y1; y <= y2; y += 1) {
                let destIndex = ((destW * y) + x1) * 4;

                destData[destIndex] = red;
                destData[destIndex + 1] = green;
                destData[destIndex + 2] = blue;
                destData[destIndex + 3] = 255;
            }
        }


        public drawHorizontalLine(x1: number, y1: number, x2: number, red: number, green: number, blue: number) {
            red = this.uint8ClampedColor(red);
            green = this.uint8ClampedColor(green);
            blue = this.uint8ClampedColor(blue);

            let destW = this.imgData.width;
            let destH = this.imgData.height;
            let destData = this.imgData.data;

            x1 = (x1 >= destW) ? (destW - 1) : (x1 < 0) ? 0 : x1;
            y1 = (y1 >= destH) ? (destH - 1) : (y1 < 0) ? 0 : y1;
            x2 = (x2 >= destW) ? (destW - 1) : (x2 < 0) ? 0 : x2;

            for (let x = x1; x <= x2; x += 1) {
                let destIndex = ((destW * y1) + x) * 4;

                destData[destIndex] = red;
                destData[destIndex + 1] = green;
                destData[destIndex + 2] = blue;
                destData[destIndex + 3] = 255;
            }
        }


        /** copy a maks frame to the display */
        public drawMask(mask: Mask, posX: number, posY: number) {

            let srcW = mask.width;
            let srcH = mask.height;
            let srcMask = mask.getMask();

            let destW = this.imgData.width;
            let destH = this.imgData.height;
            let destData = new Uint32Array(this.imgData.data.buffer);

            let destX = posX + mask.offsetX;
            let destY = posY + mask.offsetY;

            for (let y = 0; y < srcH; y++) {

                let outY = y + destY;
                if ((outY < 0) || (outY >= destH)) continue;

                for (let x = 0; x < srcW; x++) {
                    let srcIndex = ((srcW * y) + x);

                    /// ignore transparent pixels
                    if (srcMask[srcIndex] == 0) continue;

                    let outX = x + destX;
                    if ((outX < 0) || (outX >= destW)) continue;

                    let destIndex = ((destW * outY) + outX);

                    destData[destIndex] = 0xFFFFFFFF;
                }
            }

            //this.setDebugPixel(posX, posY);
        }

        /** copy a frame to the display - transparent color is changed to (r,g,b) */
        public drawFrameCovered(frame: Frame, posX: number, posY: number, red: number, green: number, blue: number) {

            let srcW = frame.width;
            let srcH = frame.height;
            let srcBuffer = frame.getBuffer();
            let srcMask = frame.getMask();

            let nullCollor = 0xFF << 24 | blue << 16 | green << 8 | red;

            let destW = this.imgData.width;
            let destH = this.imgData.height;
            let destData = new Uint32Array(this.imgData.data.buffer);

            let destX = posX + frame.offsetX;
            let destY = posY + frame.offsetY;

            red = this.uint8ClampedColor(red);
            green = this.uint8ClampedColor(green);
            blue = this.uint8ClampedColor(blue);

            for (let y = 0; y < srcH; y++) {

                let outY = y + destY;
                if ((outY < 0) || (outY >= destH)) continue;

                for (let x = 0; x < srcW; x++) {
                    let srcIndex = ((srcW * y) + x);

                    let outX = x + destX;
                    if ((outX < 0) || (outX >= destW)) continue;

                    let destIndex = ((destW * outY) + outX);

                    if (srcMask[srcIndex] == 0) {
                        /// transparent pixle
                        destData[destIndex] = nullCollor;
                    }
                    else {
                        destData[destIndex] = srcBuffer[srcIndex];
                    }
                }
            }

            //this.setDebugPixel(posX, posY);
        }


        /** copy a frame to the display */
        public drawFrame(frame: Frame, posX: number, posY: number) {

            let srcW = frame.width;
            let srcH = frame.height;
            let srcBuffer = frame.getBuffer();
            let srcMask = frame.getMask();

            let destW = this.imgData.width;
            let destH = this.imgData.height;
            let destData = new Uint32Array(this.imgData.data.buffer);

            let destX = posX + frame.offsetX;
            let destY = posY + frame.offsetY;

            for (let y = 0; y < srcH; y++) {

                let outY = y + destY;
                if ((outY < 0) || (outY >= destH)) continue;

                for (let x = 0; x < srcW; x++) {
                    let srcIndex = ((srcW * y) + x);

                    /// ignore transparent pixels
                    if (srcMask[srcIndex] == 0) continue;

                    let outX = x + destX;
                    if ((outX < 0) || (outX >= destW)) continue;

                    let destIndex = ((destW * outY) + outX);

                    destData[destIndex] = srcBuffer[srcIndex];
                }
            }

            //this.setDebugPixel(posX, posY);
        }


        /** copy a frame to the display */
        public drawFrameFlags(frame: Frame, posX: number, posY: number, destConfig: DrawProperties) {

            let srcW = frame.width;
            let srcH = frame.height;
            let srcBuffer = frame.getBuffer();
            let srcMask = frame.getMask();

            let destW = this.imgData.width;
            let destH = this.imgData.height;
            let destData = new Uint32Array(this.imgData.data.buffer);

            let destX = posX + frame.offsetX;
            let destY = posY + frame.offsetY;

            var upsideDown = destConfig.isUpsideDown;
            var noOverwrite = destConfig.noOverwrite;
            var onlyOverwrite = destConfig.onlyOverwrite;

            var mask = this.groundMask;

            for (let srcY = 0; srcY < srcH; srcY++) {

                let outY = srcY + destY;
                if ((outY < 0) || (outY >= destH)) continue;

                for (let srcX = 0; srcX < srcW; srcX++) {

                    let sourceY = upsideDown ? (srcH - srcY - 1) : srcY;
                    let srcIndex = ((srcW * sourceY) + srcX);

                    /// ignore transparent pixels
                    if (srcMask[srcIndex] == 0) continue;

                    let outX = srcX + destX;
                    if ((outX < 0) || (outX >= destW)) continue;

                    /// check flags
                    if (noOverwrite) {
                        if (mask.hasGroundAt(outX, outY)) continue;
                    }

                    if (onlyOverwrite) {
                        if (!mask.hasGroundAt(outX, outY)) continue;
                    }

                    /// draw
                    let destIndex = ((destW * outY) + outX);

                    destData[destIndex] = srcBuffer[srcIndex];
                }
            }

            //this.setDebugPixel(posX, posY);
        }

        public setDebugPixel(x: number, y: number) {
            let pointIndex = (this.imgData.width * (y) + x) * 4;

            this.imgData.data[pointIndex] = 255;
            this.imgData.data[pointIndex + 1] = 0;
            this.imgData.data[pointIndex + 2] = 0;
        }

        public getImageData(): ImageData {
            return this.imgData;
        }

        public redraw() {
            this.stage.redraw();
        }
    }
}