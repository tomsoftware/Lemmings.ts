import { LemmingsSprite } from '@/game/resources/lemmings-sprite';
import { Level } from '@/game/resources/level';
import { MaskList } from '@/game/resources/mask-list';
import { MaskProvider } from '@/game/resources/mask-provider';
import { MaskTypes } from '@/game/resources/mask-types';
import { ParticleTable } from '@/game/resources/particle-table';
import { SpriteTypes } from '@/game/resources/sprite-types';
import { DisplayImage } from '@/game/view/display-image';
import { IActionSystem } from '../action-system';
import { Lemming } from '../lemming';
import { LemmingStateType } from '../lemming-state-type';
import { SoundSystem } from '../sound-system';
import { TriggerManager } from '../trigger-manager';
import { Animation } from './../../resources/animation';

export class ActionExplodingSystem implements IActionSystem {

    public soundSystem = new SoundSystem();

    private mask: MaskList;
    private sprite: Animation;

    constructor(sprites: LemmingsSprite, masks: MaskProvider, private triggerManager: TriggerManager, private particleTable: ParticleTable) {
        this.mask = masks.GetMask(MaskTypes.EXPLODING);
        this.sprite = sprites.getAnimation(SpriteTypes.EXPLODING, false);
    }

    public getActionName(): string {
        return 'exploding';
    }

    public triggerLemAction(): boolean {
        return false;
    }

    /** render Lemming to game display */
    public draw(gameDisplay: DisplayImage, lem: Lemming) {

        if (lem.frameIndex == 0) {
            const frame = this.sprite.getFrame(lem.frameIndex);
            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }
        else {
            this.particleTable.draw(gameDisplay, lem.frameIndex - 1, lem.x, lem.y);
        }


    }


    public process(level: Level, lem: Lemming): LemmingStateType {
        lem.disable();

        lem.frameIndex++;

        if (lem.frameIndex == 1) {
            this.triggerManager.removeByOwner(lem);

            level.clearGroundWithMask(this.mask.getMask(0), lem.x, lem.y);
        }

        if (lem.frameIndex == 52) {
            return LemmingStateType.OUT_OFF_LEVEL;
        }

        return LemmingStateType.NO_STATE_TYPE;
    }


}




