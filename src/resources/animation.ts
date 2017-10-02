module Lemmings {

    export class Animation {
        frames:Frame[] = [];
        isPingPong:boolean = false;


        public getFrame(frameIndex:number):Frame {

            let frame = 0;

            if (this.isPingPong) {

                /// 0 1 2 3 => size: 4

                /// 0 => 0
                /// 1 => 1
                /// 2 => 2
                /// 3 => 3
                /// 4 => 2
                /// 5 => 1

                /// 6 => 0
                /// 7 => 1

                frame = frameIndex % (frames.length * 2 - 2);
                if (frame >= frames.length) {
                    frame = frames.length - (frame % frames.length) - 2;
                }
            }
            else {
                frame = frameIndex % frames.length;
            }

            return this.frames[frame];

            
        }

        public loadFromFile(fr: BinaryReader, bitsPerPixle: number, width: number, height: number, frames: number, colorIndexOffset: number = 0) {
            var bitBuf = 0;
            var bitBufLen = 0;
            var pixCount = width * height;


            for (let f = 0; f < frames; f++) {
                var pixBuf = new Uint8Array(pixCount);

                //- read pixle data
                for (var i = 0; i < bitsPerPixle; i++) {
                    for (var p = 0; p < pixCount; p++) {
                        if (bitBufLen <= 0) {
                            bitBuf = fr.readByte();
                            bitBufLen = 8
                        }

                        pixBuf[p] = pixBuf[p] | ((bitBuf & 0x80) >> (7 - i));
                        bitBuf = (bitBuf << 1);
                        bitBufLen--;
                    }
                }

                if (colorIndexOffset != 0) {
                    for (var p = 0; p < pixCount; p++) {
                        if (pixBuf[p] > 0) pixBuf[p] += colorIndexOffset;
                    }
                }

                this.frames.push(new Frame(width, height, pixBuf));
            }

        }
    }
}
