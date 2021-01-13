import { LogHandler } from '@/game/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { FileContainer } from '../file/file-container';
import { Frame } from '../frame';
import { ColorPalette } from './color-palette';
import { PaletteImage } from './palette-image';

/** read the VGASPECx.DAT file : it is a image used for the ground */
export class VgaSpecReader {
    private log = new LogHandler('VgaSpecReader');
    public img: Frame;

    public width = 0;
    public height = 0;

    /** the color palette stored in this file */
    public groundPalette: ColorPalette = new ColorPalette();

    constructor(vgaSpecFile: BinaryReader, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.img = new Frame(width, height);

        this.read(vgaSpecFile);
    }

    /** read the file */
    private read(fr: BinaryReader) {
        fr.setOffset(0);

        const fc = new FileContainer(fr);
        if (fc.count() != 1) {
            this.log.log('No FileContainer found!');
            return;
        }

        /// we only need the first part
        fr = fc.getPart(0);

        /// read palette
        this.readPalettes(fr, 0);

        /// process the image
        this.readImage(fr, 40);
    }

    /** read image from file */
    private readImage(fr: BinaryReader, offset: number) {

        fr.setOffset(offset);

        const width = 960;
        const chunkHeight = 40;
        const groundImagePositionX = 304;

        let startScanLine = 0;

        const pixelCount = width * chunkHeight;
        const bitBuffer = new Uint8Array(pixelCount);
        let bitBufferPos = 0;

        while (!fr.eof()) {
            const curByte = fr.readByte();

            if (curByte == 128) {
                /// end of chunk

                /// unpack image data to image-buffer
                const fileReader = new BinaryReader(bitBuffer);
                const bitImage = new PaletteImage(width, chunkHeight);

                bitImage.readImageData(fileReader, 3, 0);
                bitImage.setTransparencyByColorIndex(0);

                this.img.drawPaletteImage(bitImage.getImageBuffer(), width, chunkHeight, this.groundPalette, groundImagePositionX, startScanLine);

                startScanLine += 40;
                if (startScanLine >= this.img.height) {
                    return;
                }

                bitBufferPos = 0;
            }
            else if (curByte <= 127) {
                let copyByteCount = curByte + 1;

                /// copy copyByteCount to the bitImage
                while (!fr.eof()) {

                    /// write the next Byte
                    if (bitBufferPos >= bitBuffer.length) {
                        return;
                    }

                    bitBuffer[bitBufferPos] = fr.readByte();
                    bitBufferPos++;

                    copyByteCount--;
                    if (copyByteCount <= 0) {
                        break;
                    }
                }
            }
            else {
                /// copy n times the same value
                const repeatByte = fr.readByte();
                for (let repeatByteCount = 257 - curByte; repeatByteCount > 0; repeatByteCount--) {

                    /// write the next Byte
                    if (bitBufferPos >= bitBuffer.length) {
                        return;
                    }

                    bitBuffer[bitBufferPos] = repeatByte;
                    bitBufferPos++;

                }
            }
        }

    }


    /** load the palettes  */
    private readPalettes(fr: BinaryReader, offset: number): void {

        fr.setOffset(offset);

        /// read the VGA palette index 0..8
        for (let i = 0; i < 8; i++) {
            const r = fr.readByte() << 2;
            const g = fr.readByte() << 2;
            const b = fr.readByte() << 2;
            this.groundPalette.setColorRGB(i, r, g, b);
        }

        if (fr.eof()) {
            this.log.log('readPalettes() : unexpected end of file!: ' + fr.fileName);
            return;
        }

    }

}
