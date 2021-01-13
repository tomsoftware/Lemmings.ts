import { LemmingsSprite } from '@/game/resources/lemmings-sprite';
import { Level } from '@/game/resources/level';
import { SpriteTypes } from '@/game/resources/sprite-types';
import { DisplayImage } from '@/game/view/display-image';
import { IActionSystem } from '../action-system';
import { Lemming } from '../lemming';
import { LemmingStateType } from '../lemming-state-type';
import { SoundSystem } from '../sound-system';
import { Animation } from './../../resources/animation';

export class ActionFloatingSystem implements IActionSystem {

    private static floatSpeed: number[] = [3, 3, 3, 3, -1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2];
    private static floatFrame: number[] = [0, 1, 3, 5, 5, 5, 5, 5, 5, 6, 7, 7, 6, 5, 4, 4];

    public soundSystem = new SoundSystem();

    private sprite: Animation[] = [];

    constructor(sprites: LemmingsSprite) {
        this.sprite.push(sprites.getAnimation(SpriteTypes.UMBRELLA, false));
        this.sprite.push(sprites.getAnimation(SpriteTypes.UMBRELLA, true));
    }

    public getActionName(): string {
        return "floating";
    }


    public triggerLemAction(lem: Lemming): boolean {
        if (lem.hasParachute) {
            return false;
        }

        lem.hasParachute = true;
        return true;
    }


    /** render Lemming to game display */
    public draw(gameDisplay: DisplayImage, lem: Lemming) {
        let ani = this.sprite[(lem.lookRight ? 1 : 0)];

        let frame = ani.getFrame(ActionFloatingSystem.floatFrame[lem.frameIndex]);

        gameDisplay.drawFrame(frame, lem.x, lem.y);
    }


    public process(level: Level, lem: Lemming): LemmingStateType {

        lem.frameIndex++;
        if (lem.frameIndex >= ActionFloatingSystem.floatFrame.length) {
            /// first 8 are the opening of the umbrella
            lem.frameIndex = 8;
        }

        let speed = ActionFloatingSystem.floatSpeed[lem.frameIndex];

        for (let i = 0; i < speed; i++) {
            if (level.hasGroundAt(lem.x, lem.y + i)) {
                // landed
                lem.y += i;
                return LemmingStateType.WALKING;
            }
        }
        lem.y += speed;

        return LemmingStateType.NO_STATE_TYPE;
    }

}

