import { BaseImageInfo } from './base-image-info';
import { ColorPalette } from './color-palette';
import { TriggerTypes } from './trigger-types';

/** stores sprite image properties of objects */
export class ObjectImageInfo extends BaseImageInfo {
    public animationLoop = false;
    public firstFrameIndex = 0;
    public unknown1 = 0;
    public unknown2 = 0;
    public triggerLeft = 0;
    public triggerTop = 0;
    public triggerWidth = 0;
    public triggerHeight = 0;
    public triggerEffectId: TriggerTypes = 0;
    public previewImageIndex = 0;
    public unknown = 0;
    public trapSoundEffectId = 0;


    constructor(palette: ColorPalette) {
        super(palette);
    }
}

