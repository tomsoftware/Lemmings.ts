module Lemmings {
    
    /** image frame with index color */
    export class Frame {
        public width:number = 0;
        public height:number = 0;
        public offsetX:number = 0;
        public offsetY:number = 0;

        public data:Uint8ClampedArray;
        public mask: Int8Array;


        constructor(width:number, height:number)
        {
            this.width = width;
            this.height = height;
            this.offsetX = Math.floor(width / 2);
            this.offsetY = height;

            this.data = new Uint8ClampedArray(width * height * 4);
            this.mask = new Int8Array(width * height)
        }
        

        public readFromFile(fr:BinaryReader, bitsPerPixle: number, pallet:ColorPallet) {

            let paletImg = new PaletteImageProcessor(this.width, this.height);
            paletImg.processImage(fr, bitsPerPixle);
            let pixBuf = paletImg.getImageBuffer();
            
            let pixCount = pixBuf.length;

            /// convert color-index data to pixle image
            let imgBuf = this.data;
            let imgBufPos = 0;

            for (var i = 0; i < pixCount; i++) {
                let colorIndex = pixBuf[i];
                
                if (colorIndex == 0) {
                    
                    imgBuf[imgBufPos++] = 0;
                    imgBuf[imgBufPos++] = 0;
                    imgBuf[imgBufPos++] = 0;
                    imgBuf[imgBufPos++] = 0;
                }
                else {
                    let color = pallet.getColor(colorIndex);

                    imgBuf[imgBufPos++] = color[0];
                    imgBuf[imgBufPos++] = color[1];
                    imgBuf[imgBufPos++] = color[2];
                    imgBuf[imgBufPos++] = 255;

                }
            }

        }

        /** set the image to color=black / alpha=1 */
        public clear() {
            let buffer32  = new Uint32Array(this.data.buffer);
            let len = buffer32.length;

            while(len--)
                /// set r,g,b = 0 and alpha=FF
                buffer32[len] = 0xFF000000;

                /// for debugging
                //buffer32[len] = 0xFFCBC0FF;

                this.mask[len] = 0;
        }

        /** drwa a palette Image to this frame */
        public drawPaletteImage(srcImg: Uint8Array, srcWidth:number, srcHeight:number, pallet:ColorPallet, left:number, top:number){

            let pixIndex = 0;

            for(let y=0; y<srcHeight; y++){
                for(let x=0; x<srcWidth; x++){
                    let colorIndex = srcImg[pixIndex];
                    pixIndex++;

                    if ((colorIndex & 0x80) > 0) {
                        //this.setPixel(x+left, y+top, pallet.data[2]);
                        this.clearPixel(x+left, y+top);
                    } else {
                        this.setPixel(x+left, y+top, pallet.data[colorIndex]);
                    }
                    
                }
            }

        }


        
        /** set the color of a pixle */
        public setPixel(x: number, y:number, color:number, noOverwrite:boolean = false, onlyOverwrite:boolean=false) {
            
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

            let i = destPixelPos* 4;

            this.data[i + 0] = color[0]; //- R
            this.data[i + 1] = color[1]; //- G
            this.data[i + 2] = color[2]; //- B

            this.mask[destPixelPos] = 1;
        }


        /** set a pixle to back */
        public clearPixel(x: number, y:number) {

            if ((x < 0) || (x >= this.width)) return;
            if ((y < 0) || (y >= this.height)) return;

            let destPixelPos = y * this.width + x;
            let i = destPixelPos* 4;

            this.data[i + 0] = 0; //- R
            this.data[i + 1] = 0; //- G
            this.data[i + 2] = 0; //- B

            this.mask[destPixelPos] = 0;
        }


    }
}
