/// <reference path="../file/binary-reader.ts" />
/// <reference path="../file/file-container.ts" />

module Lemmings {


    /** read the VGASPECx.DAT file : it is a image used for the ground */
    export class VgaspecReader {
        private levelProperties: LevelProperties[] = []
        private error = new ErrorHandler("VgaspecReader");
        public img:GroundImage;

        /** the color palette stored in this file */
        public groundPallet: ColorPallet = new ColorPallet();

        constructor(vgaspecFile: BinaryReader) {
            this.read(vgaspecFile);
        }


        private read(fr: BinaryReader) {
            fr.setOffset(0);

            let fc = new FileContainer(fr);
            if (fc.count() != 1){
                this.error.log("No FileContainer found!");
                return;
            }

            /// we only need the first part
            fr = fc.getPart(0);

            /// read palette
            this.readPalletes(fr, 0);

            /// process the image
            this.readImage(fr, 40);
        }


        private readImage(fr: BinaryReader, offset:number) {

            fr.setOffset(offset);

            let width = 960;
            let chunkHeight = 40;
            let chunkCount = 4;

            this.img = new GroundImage(width, chunkHeight * chunkCount);
            this.img.clearImageArray();

            let startScanLine = 0;
            
            let bitImage = new VgaSpecBitImage(width, chunkHeight);

            while(!fr.eof()) {
                let curByte = fr.readByte();

                if (curByte == 128){
                    /// end of chunk

                    this.img.drawPalettImage(bitImage.getImages(), width, chunkHeight, this.groundPallet, 0, startScanLine);

                    startScanLine +=40;
                    if (startScanLine >= this.img.height) return;

                    bitImage.reset();
                }
                else if (curByte <= 127) {
                    let copyByteCount = curByte + 1;

                    /// copy copyByteCount to the bitImage
                    while(!fr.eof()) {
                        let curByte = fr.readByte();

                        bitImage.writeNextByte(curByte);

                        copyByteCount--;
                        if (copyByteCount <= 0) break;
                    }


                } else {
                    /// copy n times the same value
                    let repeatByte = fr.readByte();
                    for(let repeatByteCount = 257 - curByte; repeatByteCount>0; repeatByteCount--){
                        bitImage.writeNextByte(repeatByte);
                    } 
                }
            }

            
        }



          /** loads the palettes  */
        private readPalletes(fr: BinaryReader, offset: number): void {

            /// read the VGA palette index 0..8
            for (let i = 0; i < 8; i++) {
                let r = fr.readByte() << 2;
                let g = fr.readByte() << 2;
                let b = fr.readByte() << 2;
                this.groundPallet.setColorRGB(i, r, g, b);
            }

            if (fr.eof()) {
                this.error.log("readPalettes() : unexpected end of file!: " + fr.filename);
                return;
            }

        }

    }
}