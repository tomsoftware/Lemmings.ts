import { LemmingsSprite } from '@/game/resources/lemmings-sprite';
import { TriggerTypes } from '@/game/resources/lemmings/trigger-types';
import { Level } from '@/game/resources/level';
import { SpriteTypes } from '@/game/resources/sprite-types';
import { DisplayImage } from '@/game/view/display-image';
import { IActionSystem } from '../action-system';
import { Lemming } from '../lemming';
import { LemmingStateType } from '../lemming-state-type';
import { SoundSystem } from '../sound-system';
import { Trigger } from '../trigger';
import { TriggerManager } from '../trigger-manager';
import { Animation } from './../../resources/animation';

export class ActionBlockerSystem implements IActionSystem {

    public soundSystem = new SoundSystem();

    private sprite: Animation;

    constructor(sprites: LemmingsSprite, private triggerManager: TriggerManager) {
        this.sprite = sprites.getAnimation(SpriteTypes.BLOCKING, false);
    }

    public getActionName(): string {
        return 'blocking';
    }

    public triggerLemAction(lem: Lemming): boolean {
        lem.setAction(this);

        return true;
    }

    /** render Lemming to game display */
    public draw(gameDisplay: DisplayImage, lem: Lemming) {

        const frame = this.sprite.getFrame(lem.frameIndex);

        gameDisplay.drawFrame(frame, lem.x, lem.y);
    }


    public process(level: Level, lem: Lemming): LemmingStateType {

        if (lem.state == 0) {

            const trigger1 = new Trigger(TriggerTypes.BLOCKER_LEFT, lem.x - 6, lem.y + 4, lem.x - 3, lem.y - 10, 0, 0, lem);
            const trigger2 = new Trigger(TriggerTypes.BLOCKER_RIGHT, lem.x + 7, lem.y + 4, lem.x + 4, lem.y - 10, 0, 0, lem);

            this.triggerManager.add(trigger1);
            this.triggerManager.add(trigger2);

            lem.state = 1;
        }

        lem.frameIndex++;
        if (!level.hasGroundAt(lem.x, lem.y + 1)) {
            this.triggerManager.removeByOwner(lem);

            return LemmingStateType.FALLING;
        }

        return LemmingStateType.NO_STATE_TYPE;
    }

}
