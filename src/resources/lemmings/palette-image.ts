import { BinaryReader } from '../file/binary-reader';
import { Frame } from '../frame';
import { ColorPalette } from './color-palette';

/** convert the lemmings bit plain image format to real color-index-image data. 
 * The lemmings file format uses multiple plains for every bit of color.
 * E.g. Save all lowest bits of the image in a chunk then all second bits... */
export class PaletteImage {
    private pixBuf: Uint8Array;

    constructor(private width: number, private height: number) {
        const pixCount = this.width * this.height;
        this.pixBuf = new Uint8Array(pixCount);
    }

    /** return the image buffer */
    public getImageBuffer(): Uint8Array {
        return this.pixBuf;
    }


    /** convert to frame (colored image) */
    public createFrame(palette?: ColorPalette, offsetX?: number, offsetY?: number): Frame {

        /// convert color-index data to pixel image
        const resultFrame = new Frame(this.width, this.height, offsetX, offsetY);

        if (palette != null) {
            resultFrame.drawPaletteImage(this.pixBuf, this.width, this.height, palette, 0, 0);
        }

        return resultFrame;
    }


    /** convert the multi-bit-plain image to image */
    public readImageData(src: BinaryReader, bitsPerPixel = 3, startPos = -1) {

        const pixBuf = this.pixBuf;
        const pixCount = pixBuf.length;
        let bitBufLen = 0;
        let bitBuf = 0;

        if (startPos >= 0) {
            src.setOffset(startPos);
        }

        /// read image

        //- bits of a byte are stored separately
        for (let i = 0; i < bitsPerPixel; i++) {

            for (let p = 0; p < pixCount; p++) {

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
    public setTransparencyByColorIndex(transparentColorIndex: number) {
        const pixBuf = this.pixBuf;
        const pixCount = pixBuf.length;

        for (let i = 0; i < pixCount; i++) {
            if (pixBuf[i] === transparentColorIndex) {
                /// Sets the highest bit to indicate the transparency.
                pixBuf[i] = 0x80 | pixBuf[i];
            }
        }
    }


    /** use a bit plain for the transparency in the image */
    public setTransparencyByData(src: BinaryReader, startPos = -1) {

        const pixBuf = this.pixBuf;
        const pixCount = pixBuf.length;
        let bitBufLen = 0;
        let bitBuf = 0;

        if (startPos >= 0) {
            src.setOffset(startPos);
        }

        /// read image mask
        for (let p = 0; p < pixCount; p++) {

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
    }


}

