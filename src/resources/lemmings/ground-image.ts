
module Lemmings {

    /** store a ground image */
    export class GroundImage {

        public imgData: Uint8ClampedArray;
        public imgMask: Int8Array;
        public width:number;
        public height:number;


        constructor(width:number, height:number){
            this.width = width;
            this.height = height;

            this.imgData = new Uint8ClampedArray(width *  height * 4);
            this.imgMask = new Int8Array(width *  height);

        }

        /** set the image to color=black / alpha=1 */
        public clearImageArray() {
            var buffer32  = new Uint32Array(this.imgData.buffer);
            let len = buffer32.length;

            while(len--)
                /// set r,g,b = 0 and alpha=FF
                buffer32[len] = 0xFF000000;

                /// for debugging
                //buffer32[len] = 0xFFCBC0FF;
        }

        
        public drawPalettImage(srcImg: Uint8Array, srcWidth:number, srcHeight:number, pallet:ColorPallet, left:number, top:number){

            let pixIndex = 0;

            for(let y=0; y<srcHeight; y++){
                for(let x=0; x<srcWidth; x++){
                    let colorIndex = srcImg[pixIndex];
                    pixIndex++;

                    if ((colorIndex & 0x80) > 0) {
                        //this.setPixel(x+left, y+top, pallet.data[2]);
                        this.clearPixel(x+left, y+top);
                    }else {
                        this.setPixel(x+left, y+top, pallet.data[colorIndex]);
                    }
                    
                }
            }

        }


        /** set the color of a pixle */
        public setPixel(x: number, y:number, color:number, noOverwrite:boolean = false, onlyOverwrite:boolean=false) {
            
            if ((x < 0) || (x >= this.width)) return;
            if ((y < 0) || (y >= this.height)) return;

            var destPixelPos = y * this.width + x;

            if (noOverwrite) {
                /// if some data have been drawn here before
                if (this.imgMask[destPixelPos] != 0) return;
            }

            if (onlyOverwrite) {
                /// if no data have been drawn here before
                if (this.imgMask[destPixelPos] == 0) return;
            }

            var i = destPixelPos* 4;

            this.imgData[i + 0] = color[0]; //- R
            this.imgData[i + 1] = color[1]; //- G
            this.imgData[i + 2] = color[2]; //- B

            this.imgMask[destPixelPos] = 1;
        }


        /** set a pixle to back */
        public clearPixel(x: number, y:number) {

            if ((x < 0) || (x >= this.width)) return;
            if ((y < 0) || (y >= this.height)) return;

            var destPixelPos = y * this.width + x;
            var i = destPixelPos* 4;

            this.imgData[i + 0] = 0; //- R
            this.imgData[i + 1] = 0; //- G
            this.imgData[i + 2] = 0; //- B

            this.imgMask[destPixelPos] = 0;
        }

    }
}