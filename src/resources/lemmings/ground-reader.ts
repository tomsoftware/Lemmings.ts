import { LogHandler } from '@/game/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { BaseImageInfo } from './base-image-info';
import { ColorPalette } from './color-palette';
import { ObjectImageInfo } from './object-image-info';
import { PaletteImage } from './palette-image';
import { TerrainImageInfo } from './terrain-image-info';


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


  private log = new LogHandler('GroundReader');



  /** groundFile: GROUNDxO.DAT
   *  vgaTerrar: Part of VGAGx.DAT for the terrar-images
   *  vgaObject: Part of VGAGx.DAT with the object-images 
   */
  constructor(groundFile: BinaryReader, vgaTerrar: BinaryReader, vgaObject: BinaryReader) {

    if (groundFile.length != 1056) {
      this.log.log('groundFile ' + groundFile.fileName + ' has wrong size: ' + groundFile.length);
      return;
    }

    const BYTE_SIZE_OF_OBJECTS = 28 * 16;
    const BYTE_SIZE_OF_TERRAIN = 64 * 8;


    this.readPalettes(groundFile, BYTE_SIZE_OF_OBJECTS + BYTE_SIZE_OF_TERRAIN);

    this.readObjectImages(groundFile, 0, this.colorPalette);
    this.readTerrainImages(groundFile, BYTE_SIZE_OF_OBJECTS, this.groundPalette);

    this.readImages(this.imgObjects, vgaObject, 4);
    this.readImages(this.imgTerrar, vgaTerrar, 3);

  }


  /** return the images (meta + data) used for the Background */
  public getTerraImages(): TerrainImageInfo[] {
    return this.imgTerrar;
  }

  /** return the images (meta + data) used for the map objects*/
  public getObjectImages(): ObjectImageInfo[] {
    return this.imgObjects;
  }



  /** loads all images of imgList from the VGAGx file */
  private readImages(imgList: BaseImageInfo[], vga: BinaryReader, bitPerPixel: number) {

    imgList.map((img) => {

      img.frames = [];

      let filePos = img.imageLoc;

      for (let f = 0; f < img.frameCount; f++) {

        const bitImage = new PaletteImage(img.width, img.height);

        //// read image
        bitImage.readImageData(vga, bitPerPixel, filePos);
        bitImage.setTransparencyByData(vga, filePos + img.maskLoc);

        img.frames.push(bitImage.getImageBuffer());

        /// move to the next frame data
        filePos += img.frameDataSize;
      }

    })

  }


  /** loads the properties for object-images from the groundFile  */
  private readObjectImages(frO: BinaryReader, offset: number, colorPalette: ColorPalette): void {

    /// offset to the objects
    frO.setOffset(offset);

    for (let i = 0; i < 16; i++) {
      const img = new ObjectImageInfo(colorPalette);

      const flags = frO.readWordBE();

      img.animationLoop = ((flags & 1) == 0);
      img.firstFrameIndex = frO.readByte();
      img.frameCount = frO.readByte();
      img.width = frO.readByte();
      img.height = frO.readByte();
      img.frameDataSize = frO.readWordBE();
      img.maskLoc = frO.readWordBE();
      img.unknown1 = frO.readWordBE();
      img.unknown2 = frO.readWordBE();
      img.triggerLeft = frO.readWordBE() * 4;
      img.triggerTop = frO.readWordBE() * 4 - 4;
      img.triggerWidth = frO.readByte() * 4;
      img.triggerHeight = frO.readByte() * 4;
      img.triggerEffectId = frO.readByte();
      img.imageLoc = frO.readWordBE();
      img.previewImageIndex = frO.readWordBE();
      img.unknown = frO.readWordBE();
      img.trapSoundEffectId = frO.readByte();

      if (frO.eof()) {
        this.log.log('readObjectImages() : unexpected end of file: ' + frO.fileName);
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
      const img = new TerrainImageInfo(colorPalette);

      img.width = frO.readByte();
      img.height = frO.readByte();
      img.imageLoc = frO.readWordBE();
      /// use the delta offset to be compatible with the 'ObjectImageInfo.maskLoc'
      img.maskLoc = frO.readWordBE() - img.imageLoc;
      img.vgaLoc = frO.readWordBE();
      img.frameCount = 1;

      if (frO.eof()) {
        this.log.log('readTerrainImages() : unexpected end of file! ' + frO.fileName);
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
      const r = frO.readByte() << 2;
      const g = frO.readByte() << 2;
      const b = frO.readByte() << 2;
      this.groundPalette.setColorRGB(i, r, g, b);
    }

    /// read the VGA palette index 0..7
    for (let i = 0; i < 8; i++) {
      const r = frO.readByte() << 2;
      const g = frO.readByte() << 2;
      const b = frO.readByte() << 2;
      this.colorPalette.setColorRGB(i, r, g, b);
    }

    /// read the VGA palette index 8..15 for preview
    for (let i = 8; i < 16; i++) {
      const r = frO.readByte() << 2;
      const g = frO.readByte() << 2;
      const b = frO.readByte() << 2;
      this.colorPalette.setColorRGB(i, r, g, b);
    }

  }

}

