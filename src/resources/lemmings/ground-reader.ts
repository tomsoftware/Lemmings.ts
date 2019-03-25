/// <reference path="../file/binary-reader.ts"/>
/// <reference path="./color-palette.ts"/>
/// <reference path="./object-image-info.ts"/>
/// <reference path="./terrain-image-info.ts"/>


module Lemmings {

  /** read all image meta information from ground file (GROUNDxO.DAT)
   *   and uses the VGAGx File to add the image-data to this images-list.
   * The ground file contains 
   *  - the meta data for the level-background-images (e.g mud and grass)
   *  - the meta data for the level-object-images (e.g. Exists and Traps)
   *  - the color palettes to use
   * The VGAGx file contains
   *  - the image data (color-indexed) of the level-background-images
   *  - the image data (color-indexed) of the level-object-images (multi frame/animation)
  */
  export class GroundReader {

    private imgObjects: ObjectImageInfo[] = new Array(16);
    private imgTerrar: TerrainImageInfo[] = new Array(64);

    /** the color palette stored in this file */
    public groundPalette = new ColorPalette();
    public colorPalette = new ColorPalette();


    private log = new LogHandler("GroundReader");



    /** groundFile: GROUNDxO.DAT
     *  vgaTerrar: Part of VGAGx.DAT for the terrar-images
     *  vgaObject: Part of VGAGx.DAT with the object-images 
     */
    constructor(groundFile: BinaryReader,  vgaTerrar: BinaryReader, vgaObject: BinaryReader) {

      if (groundFile.length != 1056) {
        this.log.log("groundFile "+ groundFile.filename +" has wrong size: "+ groundFile.length);
        return;
      }

      let BYTE_SIZE_OF_OBJECTS = 28 * 16;
      let BYTE_SIZE_OF_TERRAIN = 64 * 8;


      this.readPalettes(groundFile, BYTE_SIZE_OF_OBJECTS + BYTE_SIZE_OF_TERRAIN);

      this.readObjectImages(groundFile, 0, this.colorPalette);
      this.readTerrainImages(groundFile, BYTE_SIZE_OF_OBJECTS, this.groundPalette);

      this.readImages(this.imgObjects, vgaObject, 4);
      this.readImages(this.imgTerrar, vgaTerrar, 3);

    }

    
    /** return the images (meta + data) used for the Background */
    public getTerraImages():TerrainImageInfo[] {
      return this.imgTerrar;
    }

    /** return the images (meta + data) used for the map objects*/
    public getObjectImages():ObjectImageInfo[] {
      return this.imgObjects;
    }
    


    /** loads all images of imgList from the VGAGx file */
    private readImages(imgList: BaseImageInfo[], vga: BinaryReader, bitPerPixle:number) {

      imgList.map((img) => {      

        img.frames = [];

        let filePos = img.imageLoc;

        for (let f = 0; f < img.frameCount; f++) {

          var bitImage = new PaletteImage(img.width, img.height);

          //// read image
          bitImage.processImage(vga, bitPerPixle, filePos);
          bitImage.processTransparentData(vga, filePos + img.maskLoc);

          img.frames.push(bitImage.getImageBuffer());

          /// move to the next frame data
          filePos += img.frameDataSize;
        }

      })

    }


    /** loads the properties for object-images from the groundFile  */
    private readObjectImages(frO: BinaryReader, offset: number, colorPalett: ColorPalette): void {

      /// offset to the objects
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

        img.palette = colorPalett;

        if (frO.eof()) {
          this.log.log("readObjectImages() : unexpected end of file: " + frO.filename);
          return;
        }

        //- add Object
        this.imgObjects[i] = img;
      }
    }

    /** loads the properties for terrain-images  */
    private readTerrainImages(frO: BinaryReader, offset: number, colorPalette: ColorPalette): void {

      frO.setOffset(offset);

      for (let i = 0; i < 64; i++) {
        let img = new TerrainImageInfo();

        img.width = frO.readByte();
        img.height = frO.readByte();
        img.imageLoc = frO.readWordBE();
        /// use the delta offset to be compatible with the 'ObjectImageInfo.maskLoc'
        img.maskLoc = frO.readWordBE() - img.imageLoc;
        img.vgaLoc = frO.readWordBE();
        img.palette = colorPalette;
        img.frameCount = 1;

        if (frO.eof()) {
          this.log.log("readTerrainImages() : unexpected end of file! " + frO.filename);
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

      /// read the VGA palette index 8..15
      for (let i = 0; i < 8; i++) {
        let r = frO.readByte() << 2;
        let g = frO.readByte() << 2;
        let b = frO.readByte() << 2;
        this.groundPalette.setColorRGB(i, r, g, b);
      }

      /// read the VGA palette index 0..7
      for (var i = 0; i < 8; i++) {
        let r = frO.readByte() << 2;
        let g = frO.readByte() << 2;
        let b = frO.readByte() << 2;
        this.colorPalette.setColorRGB(i, r, g, b);
      }

      /// read the VGA palette index 8..15 for preview
      for (let i = 8; i < 16; i++) {
        let r = frO.readByte() << 2;
        let g = frO.readByte() << 2;
        let b = frO.readByte() << 2;
        this.colorPalette.setColorRGB(i, r, g, b);
      }

    }

  }

}
