
module Lemmings {

    /** manage the lemmings bit image format */
    export class VgaSpecBitImage {
        private bitBuffer:Uint8Array;
        private bitBufferPos:number
        private pixelCount:number;
        private err = new ErrorHandler("VgaSpecBitImage");

        constructor(width:number, height:number) {

            this.pixelCount = (width * height);

            this.bitBuffer = new Uint8Array(this.pixelCount);
            this.bitBufferPos = 0;
        }

        public writeNextByte(value:number){
            if (this.bitBufferPos >= this.bitBuffer.length) return;
            this.bitBuffer[this.bitBufferPos] = value;
            this.bitBufferPos++;
        }


        public reset(){
            this.bitBufferPos = 0;
        }


        public getImages():Uint8Array {
            if (this.bitBufferPos != this.bitBuffer.length) {
                this.err.log("getImages() byte count for image mismatch: "+ this.bitBufferPos +" != "+ this.bitBuffer.length);
            }

            let pixelCount = this.pixelCount;
            let pixBuf = new Uint8Array(pixelCount);
            let inBuf = this.bitBuffer;
            let inBufPos = 0;
            let bitBuf = 0;
            let bitBufLen = 0;

            //-  3 bit per Pixel - bits of byte are stored separately
            for (var i = 0; i < 3; i++) {

                for (var p = 0; p < pixelCount; p++) {

                    if (bitBufLen <= 0) {
                        bitBuf = inBuf[inBufPos];
                        inBufPos++;
                        bitBufLen = 8;
                    }

                    pixBuf[p] = pixBuf[p] | ((bitBuf & 0x80) >> (7 - i));
                    bitBuf = (bitBuf << 1);
                    bitBufLen--;
                }
            }

            /*
             /// read image mask
            vga.setOffset(img.maskLoc);

            for (var p = 0; p < pixCount; p++) {

                if (bitBufLen <= 0) {
                    bitBuf = vga.readByte();
                    bitBufLen = 8;
                }

                if ((bitBuf & 0x80) == 0) {
                  /// Sets the highest bit to indicate the transparency.
                  pixBuf[p] = 0x80 | pixBuf[p];
                }
                bitBuf = (bitBuf << 1);
                bitBufLen--;
            }

            */
           
            return pixBuf;
        }
    }
}