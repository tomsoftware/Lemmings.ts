module Lemmings {

    /** convert the lemmings bit plain image format to real color-index-image data. 
     * The lemmings file format uses multiple plains for every bit of color.
     * E.g. Save all lowest bits of the image in a chunk then all second bits... */
    export class PaletteImageProcessor {
        private pixBuf:Uint8Array;


        constructor(private width: number, private height: number) {
            let pixCount = this.width * this.height;
            this.pixBuf = new Uint8Array(pixCount);
        }


        /** return the image buffer */
        public getImageBuffer():Uint8Array {
            return this.pixBuf;
        }


        /** convert the multi-bit-plain image to image */
        public processImage(src: BinaryReader,  bitsPerPixle: number=3, startPos?: number) {

            let pixBuf = this.pixBuf;
            let pixCount = pixBuf.length;
            let bitBufLen = 0;
            let bitBuf = 0;

            if (startPos != null){
                src.setOffset(startPos);
            }
            
            /// read image

            //-  3 bit per Pixel - bits of byte are stored separately
            for (var i = 0; i < bitsPerPixle; i++) {

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
        public processTransparentData(src: BinaryReader, startPos: number = 0){

            let pixBuf = this.pixBuf;
            let pixCount = pixBuf.length;
            let bitBufLen = 0;
            let bitBuf = 0;

            if (startPos != null){
                src.setOffset(startPos);
            }

            /// read image mask
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