import { BinaryReader } from './file/binary-reader';
import { ColorPalette } from './lemmings/color-palette';
import { SpriteTypes } from './sprite-types';
import { Animation } from './animation';

/** manage the in-game Lemmings animation sprite */
export class LemmingsSprite {

    private lemmingAnimation: Animation[] = []; //- Loockup table from ActionType -> this.animations(); First Element: left-move, Second: right-move
    private colorPalette: ColorPalette;

    /** return the animation for a given animation type */
    public getAnimation(state: SpriteTypes, right: boolean): Animation {
        return this.lemmingAnimation[this.typeToIndex(state, right)];
    }


    constructor(fr: BinaryReader, colorPalette: ColorPalette) {
        this.colorPalette = colorPalette;

        this.registerAnimation(SpriteTypes.WALKING, 1, fr, 2, 16, 10, -8, -10, 8); //- walking (r)
        this.registerAnimation(SpriteTypes.JUMPING, 1, fr, 2, 16, 10, -8, -10, 1); //- jumping (r)
        this.registerAnimation(SpriteTypes.WALKING, -1, fr, 2, 16, 10, -8, -10, 8); //- walking (l)
        this.registerAnimation(SpriteTypes.JUMPING, -1, fr, 2, 16, 10, -8, -10, 1); //- jumping (l)
        this.registerAnimation(SpriteTypes.DIGGING, 0, fr, 3, 16, 14, -8, -12, 16); //- digging
        this.registerAnimation(SpriteTypes.CLIMBING, 1, fr, 2, 16, 12, -8, -12, 8); //- climbing (r)
        this.registerAnimation(SpriteTypes.CLIMBING, -1, fr, 2, 16, 12, -8, -12, 8); //- climbing (l)
        this.registerAnimation(SpriteTypes.DROWNING, 0, fr, 2, 16, 10, -8, -10, 16); //- drowning
        this.registerAnimation(SpriteTypes.POSTCLIMBING, 1, fr, 2, 16, 12, -8, -12, 8); //- post-climb (r)
        this.registerAnimation(SpriteTypes.POSTCLIMBING, -1, fr, 2, 16, 12, -8, -12, 8); //- post-climb (l)
        this.registerAnimation(SpriteTypes.BUILDING, 1, fr, 3, 16, 13, -8, -13, 16); //- brick-laying (r)
        this.registerAnimation(SpriteTypes.BUILDING, -1, fr, 3, 16, 13, -8, -13, 16); //- brick-laying (l)
        this.registerAnimation(SpriteTypes.BASHING, 1, fr, 3, 16, 10, -8, -10, 32); //- bashing (r)
        this.registerAnimation(SpriteTypes.BASHING, -1, fr, 3, 16, 10, -8, -10, 32); //- bashing (l)
        this.registerAnimation(SpriteTypes.MINEING, 1, fr, 3, 16, 13, -8, -12, 24); //- mining (r)
        this.registerAnimation(SpriteTypes.MINEING, -1, fr, 3, 16, 13, -8, -12, 24); //- mining (l)
        this.registerAnimation(SpriteTypes.FALLING, 1, fr, 2, 16, 10, -8, -10, 4); //- falling (r)
        this.registerAnimation(SpriteTypes.FALLING, -1, fr, 2, 16, 10, -8, -10, 4); //- falling (l)
        this.registerAnimation(SpriteTypes.UMBRELLA, 1, fr, 3, 16, 16, -8, -16, 8); //- pre-umbrella (r)
        this.registerAnimation(SpriteTypes.UMBRELLA, -1, fr, 3, 16, 16, -8, -16, 8); //- umbrella (r)
        this.registerAnimation(SpriteTypes.SPLATTING, 0, fr, 2, 16, 10, -8, -10, 16); //- splatting
        this.registerAnimation(SpriteTypes.EXITING, 0, fr, 2, 16, 13, -8, -13, 8); //- exiting
        this.registerAnimation(SpriteTypes.FRYING, 1, fr, 4, 16, 14, -8, -10, 14); //- fried
        this.registerAnimation(SpriteTypes.BLOCKING, 0, fr, 2, 16, 10, -8, -10, 16); //- blocking
        this.registerAnimation(SpriteTypes.SHRUGGING, 1, fr, 2, 16, 10, -8, -10, 8); //- shrugging (r)
        this.registerAnimation(SpriteTypes.SHRUGGING, 0, fr, 2, 16, 10, -8, -10, 8); //- shrugging (l)
        this.registerAnimation(SpriteTypes.OHNO, 0, fr, 2, 16, 10, -8, -10, 16); //- oh-no-ing
        this.registerAnimation(SpriteTypes.EXPLODING, 0, fr, 3, 32, 32, -8, -10, 1); //- explosion
    }


    private typeToIndex(state: SpriteTypes, right: boolean): number {
        return state * 2 + (right ? 0 : 1);
    }


    private registerAnimation(state: SpriteTypes, dir: number, fr: BinaryReader, bitsPerPixel: number, width: number, height: number, offsetX: number, offsetY: number, frames: number) {

        //- load animation frames from file (fr)
        const animation = new Animation();

        animation.loadFromFile(fr, bitsPerPixel, width, height, frames, this.colorPalette, offsetX, offsetY);

        //- add animation to cache -add unidirectional (dir == 0) animations to both lists
        if (dir >= 0) {
            this.lemmingAnimation[this.typeToIndex(state, true)] = animation;
        }

        if (dir <= 0) {
            this.lemmingAnimation[this.typeToIndex(state, false)] = animation;
        }
    }



}
