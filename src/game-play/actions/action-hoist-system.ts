import { LemmingsSprite } from '@/game/resources/lemmings-sprite';
import { Level } from '@/game/resources/level';
import { SpriteTypes } from '@/game/resources/sprite-types';
import { DisplayImage } from '@/game/view/display-image';
import { IActionSystem } from '../action-system';
import { Lemming } from '../lemming';
import { LemmingStateType } from '../lemming-state-type';
import { SoundSystem } from '../sound-system';
import { Animation } from './../../resources/animation';

export class ActionHoistSystem implements IActionSystem {

    public soundSystem = new SoundSystem();

    private sprite: Animation[] = [];

    constructor(sprites: LemmingsSprite) {
        this.sprite.push(sprites.getAnimation(SpriteTypes.POSTCLIMBING, false));
        this.sprite.push(sprites.getAnimation(SpriteTypes.POSTCLIMBING, true));
    }

    public getActionName(): string {
        return "hoist";
    }

    public triggerLemAction(lem: Lemming): boolean {
        return false;
    }

    /** render Lemming to game display */
    public draw(gameDisplay: DisplayImage, lem: Lemming) {
        let ani = this.sprite[(lem.lookRight ? 1 : 0)];

        let frame = ani.getFrame(lem.frameIndex);

        gameDisplay.drawFrame(frame, lem.x, lem.y);
    }


    public process(level: Level, lem: Lemming): LemmingStateType {

        lem.frameIndex++;

        if (lem.frameIndex <= 4) {
            lem.y -= 2;
            return LemmingStateType.NO_STATE_TYPE;
        }

        if (lem.frameIndex >= 8) {
            return LemmingStateType.WALKING;;
        }

        return LemmingStateType.NO_STATE_TYPE;

    }

}

