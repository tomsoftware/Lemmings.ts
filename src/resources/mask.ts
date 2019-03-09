
module Lemmings {

    /** a mask */
    export class Mask {

        public width:number;
        public height:number;
        private data:Int8Array;
        public offsetX:number;
        public offsetY:number;

        constructor(fr:BinaryReader, width:number, height:number, offsetX:number, offsetY:number) {
            
            this.offsetX = offsetX;
            this.offsetY = offsetY;

            if(fr != null) {
                this.loadFromFile(fr, width, height);
            }
        }

        public getMask(): Int8Array {
            return this.data;
        }

        /** return true if the given position (x,y) of the mask is set */
        public at(x:number, y:number):boolean {
            return (this.data[y * this.width + x] == 0);
        }

        /** load a mask from a file stream */
        public loadFromFile(fr:BinaryReader, width:number, height:number): void {
            this.width = width;
            this.height = height;

            let pixCount = width*height;
            let pixBuf = new Int8Array(pixCount);

            let bitBuffer = 0;
            let bitBufferLen = 0;

            for(let i=0; i<pixCount; i++){

                if (bitBufferLen <= 0) {
                    bitBuffer = fr.readByte();
                    bitBufferLen = 8;
                }

                pixBuf[i] = (bitBuffer & 0x80);
                bitBuffer = (bitBuffer << 1);
                bitBufferLen--;
            }

            this.data = pixBuf;

      
        }


    }

}