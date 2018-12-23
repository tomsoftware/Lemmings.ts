module Lemmings {

    export class Animation {
        public frames:Frame[] = [];
        public isPingPong:boolean = false;


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

                frame = frameIndex % (this.frames.length * 2 - 2);
                if (frame >= frames.length) {
                    frame = frames.length - (frame % frames.length) - 2;
                }
            }
            else {
                frame = frameIndex % this.frames.length;
            }

            return this.frames[frame];

            
        }

        public loadFromFile(fr: BinaryReader, bitsPerPixle: number, width: number, height: number, frames: number, palette:ColorPalette) {

            for (let f = 0; f < frames; f++) {
                let paletteImg = new PaletteImage(width, height);
                paletteImg.processImage(fr, bitsPerPixle);
                this.frames.push(paletteImg.createtFrame(palette));
            }

        }
    }
}
