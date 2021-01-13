import { BinaryReader } from './file/binary-reader';
import { Frame } from './frame';
import { ColorPalette } from './lemmings/color-palette';
import { PaletteImage } from './lemmings/palette-image';

/** manage the sprites need for the game skill panel */
export class SkillPanelSprites {

    private panelSprite: Frame;
    private letterSprite: { [key: string]: Frame } = {};
    private numberSpriteLeft: Frame[] = [];
    private numberSpriteRight: Frame[] = [];
    private emptyNumberSprite: Frame;

    /** return the sprite for the skill panel */
    public getPanelSprite(): Frame {
        return this.panelSprite;
    }

    /** return a green letter */
    public getLetterSprite(letter: string): Frame {
        return this.letterSprite[letter.toUpperCase()];
    }

    /** return a number letter */
    public getNumberSpriteLeft(number: number): Frame {
        return this.numberSpriteLeft[number];
    }

    /** return a number letter */
    public getNumberSpriteRight(number: number): Frame {
        return this.numberSpriteRight[number];
    }

    public getNumberSpriteEmpty(): Frame {
        return this.emptyNumberSprite;
    }

    constructor(fr2: BinaryReader, fr6: BinaryReader, colorPalette: ColorPalette) {

        /// read skill panel
        const paletteImg = new PaletteImage(320, 40);
        paletteImg.readImageData(fr6, 4);
        this.panelSprite = paletteImg.createFrame(colorPalette);

        /// read green panel letters
        const letters: string[] = ['%', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        for (let l = 0; l < letters.length; l++) {
            const paletteImg = new PaletteImage(8, 16);
            paletteImg.readImageData(fr6, 3);
            this.letterSprite[letters[l]] = paletteImg.createFrame(colorPalette);
        }

        /// add space
        const emptyFrame = new Frame(8, 16);
        emptyFrame.fill(0, 0, 0);
        this.letterSprite[' '] = emptyFrame;

        const blackAndWithPalette = new ColorPalette();
        blackAndWithPalette.setColorRGB(1, 255, 255, 255);

        /// read panel skill-count number letters
        fr2.setOffset(0x1900);
        for (let i = 0; i < 10; i++) {
            const paletteImgRight = new PaletteImage(8, 8);
            paletteImgRight.readImageData(fr2, 1);
            paletteImgRight.setTransparencyByColorIndex(0);
            this.numberSpriteRight.push(paletteImgRight.createFrame(blackAndWithPalette));

            const paletteImgLeft = new PaletteImage(8, 8);
            paletteImgLeft.readImageData(fr2, 1);
            paletteImgLeft.setTransparencyByColorIndex(0);
            this.numberSpriteLeft.push(paletteImgLeft.createFrame(blackAndWithPalette));
        }

        /// add space
        this.emptyNumberSprite = new Frame(9, 8);
        this.emptyNumberSprite.fill(255, 255, 255);
    }

}
