import { GameTypes } from '../game-types';
import { MapObject } from '../game-play/map-object';
import { SkillTypes } from '../game-play/skill-types';
import { Trigger } from '../game-play/trigger';
import { DisplayImage } from '../view/display-image';
import { ColorPalette } from './lemmings/color-palette';
import { LevelElement } from './lemmings/level-element';
import { LevelProperties } from './lemmings/level-properties';
import { ObjectImageInfo } from './lemmings/object-image-info';
import { Mask } from './mask';
import { SolidLayer } from './solid-layer';

/** Level Data */
export class Level {

    /** the background image */
    private groundImage: Uint8ClampedArray;

    /** the background mask 0=noGround / 1=ground */
    public groundMask: SolidLayer;

    /** objects on the map: entrance/exit/traps */
    public objects: MapObject[] = [];

    public entrances: LevelElement[] = [];

    public triggers: Trigger[] = [];


    public gameType: GameTypes;
    public levelMode: number;
    public levelIndex: number;

    public name = '';
    public width = 0;
    public height = 0;
    public releaseRate = 0;
    public releaseCount = 0;
    public needCount = 0;
    public timeLimit = 0;
    public skills: SkillTypes[] = new Array(SkillTypes.length());
    public screenPositionX = 0;

    public isSuperLemming = false;

    public colorPalette: ColorPalette;
    public groundPalette: ColorPalette;
    //public previewPalette: ColorPalette;


    constructor(
        width: number,
        height: number,
        gameType: GameTypes,
        levelIndex: number,
        levelMode: number,
        levelProperties: LevelProperties,

        screenPositionX: number,
        isSuperLemming: boolean,

        groundImage: Uint8ClampedArray,
        solidLayer: SolidLayer,

        colorPalette: ColorPalette, 
        groundPalette: ColorPalette) {

    
        this.width = width;
        this.height = height;
        this.gameType = gameType;

        this.name = levelProperties.levelName;
        this.releaseRate = levelProperties.releaseRate;
        this.releaseCount = levelProperties.releaseCount;
        this.needCount = levelProperties.needCount;
        this.timeLimit = levelProperties.timeLimit;
        this.skills = levelProperties.skills;

        this.screenPositionX = screenPositionX;
        this.isSuperLemming = isSuperLemming;

        this.levelIndex = levelIndex;
        this.levelMode = levelMode;


        this.groundImage = groundImage;
        this.groundMask = solidLayer;
        this.colorPalette = colorPalette;
        this.groundPalette = groundPalette;
    }


    /** set the map objects of this level and update trigger */
    public setMapObjects(objects: LevelElement[], objectImg: ObjectImageInfo[]): void {
        this.entrances = [];
        this.triggers = [];
        this.objects = [];

        /// process all objects
        for (let i = 0; i < objects.length; i++) {
            const ob = objects[i];
            const objectInfo = objectImg[ob.id];

            /// add object
            const newMapObject = new MapObject(ob, objectInfo);
            this.objects.push(newMapObject);

            /// add entrances
            if (ob.id == 1) this.entrances.push(ob);

            /// add triggers
            if (objectInfo.triggerEffectId != 0) {
                const x1 = ob.x + objectInfo.triggerLeft;
                const y1 = ob.y + objectInfo.triggerTop;

                const x2 = x1 + objectInfo.triggerWidth;
                const y2 = y1 + objectInfo.triggerHeight;

                const newTrigger = new Trigger(objectInfo.triggerEffectId, x1, y1, x2, y2, 0, objectInfo.trapSoundEffectId);

                this.triggers.push(newTrigger);
            }

        }
    }

    /** check if a y-position is out of the level */
    public isOutOfLevel(y: number): boolean {
        return ((y >= this.height) || (y <= 0));
    }

    /** return the layer that defines if a pixel in the level is solid */
    public getGroundMaskLayer(): SolidLayer {
        return this.groundMask;
    }




    /** clear with mask  */
    public clearGroundWithMask(mask: Mask, x: number, y: number) {
        x += mask.offsetX;
        y += mask.offsetY;

        for (let dY = 0; dY < mask.height; dY++) {
            for (let dX = 0; dX < mask.width; dX++) {
                if (!mask.at(dX, dY)) {
                    this.clearGroundAt(x + dX, y + dY);
                }
            }
        }

    }

    /** set a point in the map to solid ground  */
    public setGroundAt(x: number, y: number, palletIndex: number) {
        this.groundMask.setGroundAt(x, y);

        const index = (y * this.width + x) * 4;
        this.groundImage[index + 0] = this.colorPalette.getR(palletIndex);
        this.groundImage[index + 1] = this.colorPalette.getG(palletIndex);
        this.groundImage[index + 2] = this.colorPalette.getB(palletIndex);
    }

    /** checks if a point is solid ground  */
    public hasGroundAt(x: number, y: number): boolean {
        return this.groundMask.hasGroundAt(x, y);
    }


    /** clear a point  */
    public clearGroundAt(x: number, y: number) {
        this.groundMask.clearGroundAt(x, y);

        const index = (y * this.width + x) * 4;

        this.groundImage[index + 0] = 0; // R
        this.groundImage[index + 1] = 0; // G
        this.groundImage[index + 2] = 0; // B
    }




    /** render ground to display */
    public render(gameDisplay: DisplayImage) {
        gameDisplay.initSize(this.width, this.height);

        gameDisplay.setBackground(this.groundImage, this.groundMask);
    }

}

