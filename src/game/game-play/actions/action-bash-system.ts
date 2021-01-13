import { LemmingsSprite } from '@/game/resources/lemmings-sprite';
import { Level } from '@/game/resources/level';
import { MaskList } from '@/game/resources/mask-list';
import { MaskProvider } from '@/game/resources/mask-provider';
import { MaskTypes } from '@/game/resources/mask-types';
import { SolidLayer } from '@/game/resources/solid-layer';
import { SpriteTypes } from '@/game/resources/sprite-types';
import { DisplayImage } from '@/game/view/display-image';
import { IActionSystem } from '../action-system';
import { Lemming } from '../lemming';
import { LemmingStateType } from '../lemming-state-type';
import { SoundSystem } from '../sound-system';
import { Animation } from './../../resources/animation';

export class ActionBashSystem implements IActionSystem {

    public soundSystem = new SoundSystem();

    private sprite: Animation[] = [];
    private masks: MaskList[] = [];

    constructor(sprites: LemmingsSprite, masks: MaskProvider) {

        this.sprite.push(sprites.getAnimation(SpriteTypes.BASHING, false));
        this.sprite.push(sprites.getAnimation(SpriteTypes.BASHING, true));

        this.masks.push(masks.GetMask(MaskTypes.BASHING_L));
        this.masks.push(masks.GetMask(MaskTypes.BASHING_R));
    }

    public getActionName(): string {
        return 'bashing';
    }

    /** user called this action */
    public triggerLemAction(lem: Lemming): boolean {
        lem.setAction(this);

        return true;
    }

    /** render Lemming to game display */
    public draw(gameDisplay: DisplayImage, lem: Lemming) {
        const ani = this.sprite[(lem.lookRight ? 1 : 0)];

        const frame = ani.getFrame(lem.frameIndex);

        gameDisplay.drawFrame(frame, lem.x, lem.y);
    }



    public process(level: Level, lem: Lemming): LemmingStateType {

        const groundMask = level.getGroundMaskLayer();

        lem.frameIndex++;

        const state = lem.frameIndex % 16;

        /// move lemming
        if (state > 10) {
            lem.x += (lem.lookRight ? 1 : -1);

            const yDelta = this.findGapDelta(groundMask, lem.x, lem.y);
            lem.y += yDelta;

            if (yDelta == 3) {
                return LemmingStateType.FALLING;
            }
        }

        /// apply mask
        if ((state > 1) && (state < 6)) {

            const mask = this.masks[(lem.lookRight ? 1 : 0)];
            const maskIndex = state - 2;

            level.clearGroundWithMask(mask.getMask(maskIndex), lem.x, lem.y);
        }

        /// check if end of solid?
        if (state == 5) {

            if (this.findHorizontalSpace(groundMask, lem.x + (lem.lookRight ? 8 : -8), lem.y - 6, lem.lookRight) == 4) {
                return LemmingStateType.WALKING;
            }
        }


        return LemmingStateType.NO_STATE_TYPE;

    }

    private findGapDelta(groundMask: SolidLayer, x: number, y: number): number {
        for (let i = 0; i < 3; i++) {
            if (groundMask.hasGroundAt(x, y + i)) {
                return i;
            }
        }
        return 3;

    }

    private findHorizontalSpace(groundMask: SolidLayer, x: number, y: number, lookRight: boolean) {
        for (let i = 0; i < 4; i++) {

            if (groundMask.hasGroundAt(x, y)) {
                return i;
            }
            x += (lookRight ? 1 : -1)
        }
        return 4;
    }

}
