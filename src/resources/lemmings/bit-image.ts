module Lemmings {

    /** convert the lemmings bit plain image format to real image data. 
     * The lemmings file format uses multiple plains for every bit of color.
     * E.g. Save all lowest bits of the image in a chunk then all second bits... */
    export class BitPlainImage {
        private pixBuf:Uint8Array;


        constructor(private reader: BinaryReader, private width: number, private height: number) {
            let pixCount = this.width * this.height;
            this.pixBuf = new Uint8Array(pixCount);
        }


        /** return the image buffer */
        public getImageBuffer() {
            return this.pixBuf;
        }


        /** convert the multi-bit-plain image to image */
        public processImage(startPos: number = 0) {

            let src = this.reader;
            let pixBuf = this.pixBuf;
            let pixCount = pixBuf.length;
            let bitBufLen = 0;
            let bitBuf = 0;


            /// read image
            src.setOffset(startPos);

            //-  3 bit per Pixel - bits of byte are stored separately
            for (var i = 0; i < 3; i++) {

                for (var p = 0; p < pixCount; p++) {

                    if (bitBufLen <= 0) {
                        bitBuf = src.readByte();
                        bitBufLen = 8;
                    }

                    pixBuf[p] = pixBuf[p] | ((bitBuf & 0x80) >> (7 - i));
                    bitBuf = (bitBuf << 1);
                    bitBufLen--;
                }
            }

            this.pixBuf = pixBuf;
        }


        /** use a color-index for the transparency in the image */
        public processTransparentByColorIndex(transparentColorIndex:number) {
            let pixBuf = this.pixBuf;
            let pixCount = pixBuf.length;

            for(let i=0; i<pixCount; i++){
                if (pixBuf[i] == transparentColorIndex) {
                    /// Sets the highest bit to indicate the transparency.
                    pixBuf[i] = 0x80 | pixBuf[i];
                }
            }

            this.pixBuf = pixBuf;
        }


        
        /** use a bit plain for the transparency in the image */
        public processTransparentData(startPos: number = 0){

            let src = this.reader;
            let pixBuf = this.pixBuf;
            let pixCount = pixBuf.length;
            let bitBufLen = 0;
            let bitBuf = 0;

            /// read image mask
            src.setOffset(startPos);

            for (var p = 0; p < pixCount; p++) {

                if (bitBufLen <= 0) {
                    bitBuf = src.readByte();
                    bitBufLen = 8;
                }

                if ((bitBuf & 0x80) == 0) {
                    /// Sets the highest bit to indicate the transparency.
                    pixBuf[p] = 0x80 | pixBuf[p];
                }
                bitBuf = (bitBuf << 1);
                bitBufLen--;
            }

            this.pixBuf = pixBuf;

        }

        
    }

}