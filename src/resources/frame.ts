module Lemmings {
    
        /** image frame with index color */
        export class Frame {
            public width:number = 0;
            public height:number = 0;
            public offsetX:number = 0;
            public offsetY:number = 0;

            public data:Uint8Array;
 
            /*
            constructor(width:number, height:number, data:Uint8Array) {
                this.width = width;
                this.height = height;
                this.data = data;
                this.offsetX = Math.floor(this.width / 2);
                this.offsetY = this.height;
            }
            */

            constructor(width:number, height:number, fr:BinaryReader, bitsPerPixle: number, pallet:ColorPallet) {
                
                this.width = width;
                this.height = height;
                this.offsetX = Math.floor(width / 2);
                this.offsetY = height;

                let bitBuf = 0;
                let bitBufLen = 0;
      
                let pixCount = width * height;

                let pixBuf = new Uint8Array(pixCount);
       

                //- read color-index data
                for (let i = 0; i < bitsPerPixle; i++) {
                    for (let p = 0; p < pixCount; p++) {
                        if (bitBufLen <= 0) {
                            bitBuf = fr.readByte();
                            bitBufLen = 8
                        }

                        pixBuf[p] = pixBuf[p] | ((bitBuf & 0x80) >> (7 - i));
                        bitBuf = (bitBuf << 1);
                        bitBufLen--;
                    }
                }

                /// convert color-index data to pixle image
                var imgBuf = new Uint8Array(pixCount * 4);
                var imgBufPos = 0;

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

                this.data = imgBuf;

            }
        }
    }
    