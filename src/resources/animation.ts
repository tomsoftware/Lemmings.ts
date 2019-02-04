module Lemmings {

    export class Animation {
        public frames:Frame[] = [];
        public isPingPong:boolean = false;
        public isRepeat :boolean = true;
        public firstFrameIndex:number = 0;

        public getFrame(frameIndex:number):Frame {
            
            frameIndex = frameIndex + this.firstFrameIndex;

            let frame = 0;

            if (this.isPingPong) {

                /// 0 1 2 3 => size: 4
                ///   0 => 0   1 => 1    2 => 2
                ///   3 => 3   4 => 2    5 => 1

                frame = frameIndex % (this.frames.length * 2 - 2);
                if (frame >= frames.length) {
                    frame = frames.length - (frame % frames.length) - 2;
                }
            }
            else if (this.isRepeat) {
                frame = frameIndex % this.frames.length;
            }
            else {
                if (frameIndex < this.frames.length) frame = frameIndex;
            }

            return this.frames[frame];
        }

        /** load all images for this animation from a file */
        public loadFromFile(fr: BinaryReader, bitsPerPixle: number, width: number, height: number, frames: number, palette:ColorPalette, offsetX:number=null, offsetY:number=null) {

            for (let f = 0; f < frames; f++) {
                let paletteImg = new PaletteImage(width, height);
                paletteImg.processImage(fr, bitsPerPixle);
                paletteImg.processTransparentByColorIndex(0);

                this.frames.push(paletteImg.createFrame(palette, offsetX, offsetY));
            }

        }
    }
}
