import { BinaryReader } from './file/binary-reader';
import { Mask } from './mask';

/** a mask */
export class MaskList {

    private frames: Mask[];

    constructor(frames: Mask[]) {
        this.frames = frames;
    }


    public get length(): number {
        return frames.length;
    }

    public getMask(index: number): Mask {
        return this.frames[index];
    }

    public static fromFile(fr: BinaryReader, width: number, height: number, count: number, offsetX: number, offsetY: number) {
        let frames: Mask[] = [];
  
        for (let i = 0; i < count; i++) {
            let mask = Mask.fromFile(fr, width, height, offsetX, offsetY);
            frames.push(mask);
        }

        return new MaskList(frames);
    }

}
