import { DrawProperties } from '../resources/draw-properties';
import { Frame } from '../resources/frame';
import { LevelElement } from '../resources/lemmings/level-element';
import { ObjectImageInfo } from '../resources/lemmings/object-image-info';
import { Animation } from '../resources/animation';

/** represent a object (e.g. Exit, Entry, Trap, ...) */
export class MapObject {
    public animation: Animation;
    public x: number;
    public y: number;
    public drawProperties: DrawProperties;

    constructor(ob: LevelElement, objectImg: ObjectImageInfo) {
        this.x = ob.x;
        this.y = ob.y;

        this.drawProperties = ob.drawProperties;

        this.animation = new Animation();

        this.animation.isRepeat = objectImg.animationLoop;
        this.animation.firstFrameIndex = objectImg.firstFrameIndex;

        for (let i = 0; i < objectImg.frames.length; i++) {
            let newFrame = new Frame(objectImg.width, objectImg.height);

            //newFrame.clear();
            newFrame.drawPaletteImage(objectImg.frames[i], objectImg.width, objectImg.height, objectImg.palette, 0, 0);

            this.animation.frames.push(newFrame);
        }
    }
}
