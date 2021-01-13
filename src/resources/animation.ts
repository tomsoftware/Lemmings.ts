import { BinaryReader } from './file/binary-reader';
import { Frame } from './frame';
import { ColorPalette } from './lemmings/color-palette';
import { PaletteImage } from './lemmings/palette-image';

export class Animation {
    public frames: Frame[] = [];
    public isRepeat = true;
    public firstFrameIndex = 0;

    public getFrame(frameIndex: number): Frame {

        frameIndex = frameIndex + this.firstFrameIndex;

        let frame = 0;

        if (this.isRepeat) {
            frame = frameIndex % this.frames.length;
        }
        else {
            if (frameIndex < this.frames.length) frame = frameIndex;
        }

        return this.frames[frame];
    }

    /** load all images for this animation from a file */
    public loadFromFile(fr: BinaryReader, bitsPerPixel: number, width: number, height: number, frames: number, palette: ColorPalette, offsetX?: number, offsetY?: number) {

        for (let f = 0; f < frames; f++) {
            const paletteImg = new PaletteImage(width, height);
            paletteImg.readImageData(fr, bitsPerPixel);
            paletteImg.setTransparencyByColorIndex(0);

            this.frames.push(paletteImg.createFrame(palette, offsetX, offsetY));
        }

    }
}
