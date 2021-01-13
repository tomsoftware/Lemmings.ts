import { ColorPalette } from './lemmings/color-palette';
import { PaletteImage } from './lemmings/palette-image';
import { BinaryReader } from './file/binary-reader';

export class MainImageSprites {
    private fr3: BinaryReader;
    private fr4: BinaryReader;
    private colorPalette: ColorPalette;

    public constructor(fr3: BinaryReader, fr4: BinaryReader) {
        this.fr3 = fr3;
        this.fr4 = fr4;

        this.colorPalette = new ColorPalette();
        this.colorPalette.setMainColors();
    }

    public getBackground() {
        const paletteImg = new PaletteImage(320, 104);
        paletteImg.readImageData(this.fr3, 2, 0);
        return paletteImg.createFrame(this.colorPalette);
    }

    public getLogo() {
        const paletteImg = new PaletteImage(632, 94);
        paletteImg.readImageData(this.fr3, 4, 0x2080);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }

    public getF1() {
        const paletteImg = new PaletteImage(120, 61);
        paletteImg.readImageData(this.fr3, 4, 0x9488);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }

    public getF2() {
        const paletteImg = new PaletteImage(120, 61);
        paletteImg.readImageData(this.fr3, 4, 0xA2D4);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }


    public getF3() {
        const paletteImg = new PaletteImage(120, 61);
        paletteImg.readImageData(this.fr3, 4, 0xB120);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }

    public getF4() {
        const paletteImg = new PaletteImage(120, 61);
        paletteImg.readImageData(this.fr3, 4, 0xDC04);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }

    public getLevelRating() {
        const paletteImg = new PaletteImage(120, 61);
        paletteImg.readImageData(this.fr3, 4, 0xBF6C);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }

    public getExit() {
        const paletteImg = new PaletteImage(120, 61);
        paletteImg.readImageData(this.fr3, 4, 0xCDB8);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }

    public getMusicIcon() {
        const paletteImg = new PaletteImage(64, 31);
        paletteImg.readImageData(this.fr3, 4, 0xEA50);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }

    public getFxIcon() {
        const paletteImg = new PaletteImage(64, 31);
        paletteImg.readImageData(this.fr3, 4, 0xEE30);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }


    public getLeftScroll() {
        const paletteImg = new PaletteImage(48, 16);
        paletteImg.readImageData(this.fr4, 4, 0x2A00);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }

    public getRightScroll() {
        const paletteImg = new PaletteImage(48, 16);
        paletteImg.readImageData(this.fr4, 4, 0x4200);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }

    public getReel() {
        const paletteImg = new PaletteImage(16, 16);
        paletteImg.readImageData(this.fr4, 4, 0x5A00);
        paletteImg.setTransparencyByColorIndex(0);
        return paletteImg.createFrame(this.colorPalette);
    }
}