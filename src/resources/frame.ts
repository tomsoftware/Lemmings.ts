module Lemmings {

    /** image frame with index color */
    export class Frame {
        public width: number = 0;
        public height: number = 0;
        public offsetX: number = 0;
        public offsetY: number = 0;

        private data: Uint32Array;
        public mask: Int8Array;

        public getData(): Uint8ClampedArray{
            return new Uint8ClampedArray(this.data.buffer);
        }

        constructor(width: number, height: number, offsetX?: number, offsetY?: number) {
            this.width = Math.trunc(width);
            this.height = Math.trunc(height);

            if (offsetX == null) {
                this.offsetX = 0;
            }
            else {
                this.offsetX = Math.trunc(offsetX);
            }

            if (offsetY == null) {
                this.offsetY = 0;
            }
            else {
                this.offsetY = Math.trunc(offsetY);
            }

            let pixCount = this.width * this.height;
            this.data = new Uint32Array(pixCount);
            this.mask = new Int8Array(pixCount)

            this.clear();
        }

        /** set the image to color=black / alpha=255 / mask=0 */
        public clear() {
            this.data.fill(0xFF000000);
            this.mask.fill(0);
        }

        /** draw a palette Image to this frame */
        public drawPaletteImage(srcImg: Uint8Array, srcWidth: number, srcHeight: number, palette: ColorPalette, left: number, top: number) {

            let pixIndex = 0;

            for (let y = 0; y < srcHeight; y++) {
                for (let x = 0; x < srcWidth; x++) {
                    let colorIndex = srcImg[pixIndex];
                    pixIndex++;

                    if ((colorIndex & 0x80) > 0) {
                        this.clearPixel(x + left, y + top);
                    } else {
                        this.setPixel(x + left, y + top, palette.data[colorIndex]);
                    }

                }
            }
        }

        /** set the color of a pixle */
        public setPixel(x: number, y: number, color: number, noOverwrite: boolean = false, onlyOverwrite: boolean = false) {

            if ((x < 0) || (x >= this.width)) return;
            if ((y < 0) || (y >= this.height)) return;

            let destPixelPos = y * this.width + x;

            if (noOverwrite) {
                /// if some data have been drawn here before
                if (this.mask[destPixelPos] != 0) return;
            }

            if (onlyOverwrite) {
                /// if no data have been drawn here before
                if (this.mask[destPixelPos] == 0) return;
            }

            this.data[destPixelPos] = (0xFF << 24) | (color[2] << 16) | (color[1] << 8) | (color[0]); //- R
            this.mask[destPixelPos] = 1;
        }

        /** set a pixle to back */
        public clearPixel(x: number, y: number) {

            if ((x < 0) || (x >= this.width)) return;
            if ((y < 0) || (y >= this.height)) return;

            let destPixelPos = y * this.width + x;

            this.data[destPixelPos] = 0xFF000000;
            this.mask[destPixelPos] = 0;
        }

    }
}
