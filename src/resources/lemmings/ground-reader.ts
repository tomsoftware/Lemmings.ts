/// <reference path="../file/binary-reader.ts"/>
/// <reference path="../error-handler.ts"/>
/// <reference path="./color-pallet.ts"/>
/// <reference path="./object-image-info.ts"/>
/// <reference path="./terrain-image-info.ts"/>


module Lemmings {

  /** access to ground file (GROUNDxO.DAT) 
   * The Ground file 
  */
  export class GroundReader {

    public imgObjects: ObjectImageInfo[] = new Array(16);
    public imgTerrar: TerrainImageInfo[] = new Array(64);

    /** the color palette stored in this file */
    public groundPallet = new ColorPallet();
    public colorPallet = new ColorPallet();
    public previewPallet = new ColorPallet();


    private error = new ErrorHandler("GroundReader");


    constructor(groundFile: BinaryReader, vgaObject: BinaryReader, vgaTerrar: BinaryReader) {

      if (groundFile.length != 1056) {
        this.error.log("groundFile "+ groundFile.filename +" has wrong size: "+ groundFile.length);
        return;
      }

      let BYTE_SIZE_OF_OBJECTS = 28 * 16;
      let BYTE_SIZE_OF_TERRAIN = 64 * 8;


      this.readPalettes(groundFile, BYTE_SIZE_OF_OBJECTS + BYTE_SIZE_OF_TERRAIN);

      this.readObjectImages(groundFile, 0, this.colorPallet);
      this.readTerrainImages(groundFile, BYTE_SIZE_OF_OBJECTS, this.groundPallet);

      this.readImages(this.imgObjects, vgaObject);
      this.readImages(this.imgTerrar, vgaTerrar);

    }

    /** load the images from the VGAG file to the Image Objects in the List */
    private readImages(imgList: BaseImageInfo[], vga: BinaryReader) {

      imgList.map((img) => {

        let bitBuf = 0;
        let bitBufLen = 0;
        let pixCount = img.width * img.height;

        img.frames = [];

        let filePos = img.imageLoc;


        for (let f = 0; f < img.frameCount; f++) {
            /// read image
            vga.setOffset(filePos);

            var pixBuf = new Uint8Array(pixCount);

            //-  3 bit per Pixel - bits of byte are stored separately
            for (var i = 0; i < 3; i++) {

                for (var p = 0; p < pixCount; p++) {

                    if (bitBufLen <= 0) {
                        bitBuf = vga.readByte();
                        bitBufLen = 8;
                    }

                    pixBuf[p] = pixBuf[p] | ((bitBuf & 0x80) >> (7 - i));
                    bitBuf = (bitBuf << 1);
                    bitBufLen--;
                }
            }

            /// read image mask
            vga.setOffset(img.maskLoc);

            for (var p = 0; p < pixCount; p++) {

                if (bitBufLen <= 0) {
                    bitBuf = vga.readByte();
                    bitBufLen = 8;
                }

                if ((bitBuf & 0x80) == 0) {
                  /// Sets the highest bit to indicate the transparency.
                  pixBuf[p] = 0x80 | pixBuf[p];
                }
                bitBuf = (bitBuf << 1);
                bitBufLen--;
            }


            img.frames.push(pixBuf);

            /// move to the next frame data
            filePos += img.frameDataSize;
        }

      })

    }


    /** loads the properties for object-images  */
    private readObjectImages(frO: BinaryReader, offset: number, colorPalett: ColorPallet): void {

      /// read the object from 
      frO.setOffset(offset);

      for (let i = 0; i < 16; i++) {
        let img = new ObjectImageInfo();

        let flags = frO.readWordBE();

        img.animationLoop = ((flags & 1) == 0);
        img.firstFrameIndex = frO.readByte();
        img.frameCount = frO.readByte();
        img.width = frO.readByte();
        img.height = frO.readByte();
        img.frameDataSize = frO.readWordBE();
        img.maskLoc = frO.readWordBE();
        img.unknown1 = frO.readWordBE();
        img.unknown2 = frO.readWordBE();
        img.trigger_left = frO.readWordBE() * 4;
        img.trigger_top = frO.readWordBE() * 4 - 4;
        img.trigger_width = frO.readByte() * 4;
        img.trigger_height = frO.readByte() * 4;
        img.trigger_effect_id = frO.readByte();
        img.imageLoc = frO.readWordBE();
        img.preview_image_index = frO.readWordBE();
        img.unknown = frO.readWordBE();
        img.trap_sound_effect_id = frO.readByte();

        img.pallet = colorPalett;

        if (frO.eof()) {
          this.error.log("readObjectImages() : unexpected end of file: " + frO.filename);
          return;
        }

        //- add Object
        this.imgObjects[i] = img;
      }
    }

    /** loads the properties for terrain-images  */
    private readTerrainImages(frO: BinaryReader, offset: number, colorPallet: ColorPallet): void {

      frO.setOffset(offset);

      for (let i = 0; i < 64; i++) {
        let img = new TerrainImageInfo();

        img.width = frO.readByte();
        img.height = frO.readByte();
        img.imageLoc = frO.readWordBE();
        img.maskLoc = frO.readWordBE();
        img.vgaLoc = frO.readWordBE();
        img.pallet = colorPallet;
        img.frameCount = 1;

        if (frO.eof()) {
          this.error.log("readTerrainImages() : unexpected end of file! " + frO.filename);
          return;
        }

        //- add Object
        this.imgTerrar[i] = img;
      }

    }


    /** loads the palettes  */
    private readPalettes(frO: BinaryReader, offset: number): void {

      /// jump over the EGA palettes
      frO.setOffset(offset + 3 * 8);

      this.colorPallet.initLockedValues();
      this.previewPallet.initLockedValues();
      this.groundPallet;

      /// read the VGA palette index 8..15
      for (let i = 0; i < 8; i++) {
        let r = frO.readByte() << 2;
        let g = frO.readByte() << 2;
        let b = frO.readByte() << 2;
        this.groundPallet.setColorRGB(i, r, g, b);
      }

      /// read the VGA palette index 0..7
      for (var i = 0; i < 8; i++) {
        let r = frO.readByte() << 2;
        let g = frO.readByte() << 2;
        let b = frO.readByte() << 2;
        this.previewPallet.setColorRGB(i, r, g, b);
        this.colorPallet.setColorRGB(i, r, g, b);
      }

      /// read the VGA palette index 8..15 for preview
      for (let i = 8; i < 16; i++) {
        let r = frO.readByte() << 2;
        let g = frO.readByte() << 2;
        let b = frO.readByte() << 2;
        this.previewPallet.setColorRGB(i, r, g, b);
      }

      if (frO.eof()) {
        this.error.log("readPalettes() : unexpected end of file!: " + frO.filename);
        return;
      }

    }

  }

}
