import { LemmingsSprite } from '@/game/resources/lemmings-sprite';
import { Level } from '@/game/resources/level';
import { SpriteTypes } from '@/game/resources/sprite-types';
import { DisplayImage } from '@/game/view/display-image';
import { IActionSystem } from '../action-system';
import { Lemming } from '../lemming';
import { LemmingStateType } from '../lemming-state-type';
import { SoundSystem } from '../sound-system';
import { Animation } from './../../resources/animation';

export class ActionClimbSystem implements IActionSystem {

    public soundSystem = new SoundSystem();

    private sprite: Animation[] = [];

    constructor(sprites: LemmingsSprite) {
        this.sprite.push(sprites.getAnimation(SpriteTypes.CLIMBING, false));
        this.sprite.push(sprites.getAnimation(SpriteTypes.CLIMBING, true));
    }


    public getActionName(): string {
        return "climbing";
    }

    public triggerLemAction(lem: Lemming): boolean {
        if (lem.canClimb) {
            return false;
        }

        lem.canClimb = true;
        return true;
    }


    /** render Lemming to game display */
    public draw(gameDisplay: DisplayImage, lem: Lemming) {
        let ani = this.sprite[(lem.lookRight ? 1 : 0)];

        let frame = ani.getFrame(lem.frameIndex);

        gameDisplay.drawFrame(frame, lem.x, lem.y);
    }


    public process(level: Level, lem: Lemming): LemmingStateType {

        lem.frameIndex = (lem.frameIndex + 1) % 8;

        if (lem.frameIndex < 4) {
            // check for top
            if (!level.hasGroundAt(lem.x, lem.y - lem.frameIndex - 7)) {
                lem.y = lem.y - lem.frameIndex + 2;
                return LemmingStateType.HOISTING;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }
        else {
            lem.y--;

            if (level.hasGroundAt(lem.x + (lem.lookRight ? -1 : 1), lem.y - 8)) {

                lem.lookRight = !lem.lookRight;
                lem.x += (lem.lookRight ? 2 : -2);
                return LemmingStateType.FALLING;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }

    }

}
