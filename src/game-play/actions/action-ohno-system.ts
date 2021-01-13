import { LemmingsSprite } from '@/game/resources/lemmings-sprite';
import { Level } from '@/game/resources/level';
import { SpriteTypes } from '@/game/resources/sprite-types';
import { DisplayImage } from '@/game/view/display-image';
import { IActionSystem } from '../action-system';
import { Lemming } from '../lemming';
import { LemmingStateType } from '../lemming-state-type';
import { SoundSystem } from '../sound-system';
import { Animation } from './../../resources/animation';

export class ActionOhNoSystem implements IActionSystem {

    public soundSystem = new SoundSystem();

    private sprite: Animation;

    constructor(sprites: LemmingsSprite) {
        this.sprite = sprites.getAnimation(SpriteTypes.OHNO, false);
    }

    public getActionName(): string {
        return "oh-no";
    }

    public triggerLemAction(lem: Lemming): boolean {
        return false;
    }

    /** render Lemming to game display */
    public draw(gameDisplay: DisplayImage, lem: Lemming) {
        let frame = this.sprite.getFrame(lem.frameIndex);

        gameDisplay.drawFrame(frame, lem.x, lem.y);
    }


    public process(level: Level, lem: Lemming): LemmingStateType {

        lem.frameIndex++;

        if (lem.frameIndex == 16) {
            // play sound: explosion
            return LemmingStateType.EXPLODING;
        }

        // fall down!
        for (let i = 0; i < 3; i++) {
            if (!level.hasGroundAt(lem.x, lem.y + 1)) {
                lem.y++;
                break;
            }
        }

        return LemmingStateType.NO_STATE_TYPE;

    }

}

