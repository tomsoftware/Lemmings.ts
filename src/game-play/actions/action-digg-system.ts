import { LemmingsSprite } from '@/game/resources/lemmings-sprite';
import { Level } from '@/game/resources/level';
import { SpriteTypes } from '@/game/resources/sprite-types';
import { DisplayImage } from '@/game/view/display-image';
import { IActionSystem } from '../action-system';
import { Lemming } from '../lemming';
import { LemmingStateType } from '../lemming-state-type';
import { SoundSystem } from '../sound-system';
import { Animation } from './../../resources/animation';

export class ActionDiggSystem implements IActionSystem {

    public soundSystem = new SoundSystem();
    private sprite: Animation[] = [];

    constructor(sprites: LemmingsSprite) {
        this.sprite.push(sprites.getAnimation(SpriteTypes.DIGGING, false));
        this.sprite.push(sprites.getAnimation(SpriteTypes.DIGGING, true));
    }


    /** render Lemming to game display */
    public draw(gameDisplay: DisplayImage, lem: Lemming) {
        let ani = this.sprite[(lem.lookRight ? 1 : 0)];

        let frame = ani.getFrame(lem.frameIndex);

        gameDisplay.drawFrame(frame, lem.x, lem.y);
    }


    public getActionName(): string {
        return 'digging';
    }

    public triggerLemAction(lem: Lemming): boolean {
        lem.setAction(this);

        return true;
    }


    public process(level: Level, lem: Lemming): LemmingStateType {

        if (lem.state == 0) {
            this.digRow(level, lem, lem.y - 2);
            this.digRow(level, lem, lem.y - 1);
            lem.state = 1;
        } else {
            lem.frameIndex = (lem.frameIndex + 1) % 16;
        }

        if (!(lem.frameIndex & 0x07)) {
            lem.y++;

            if (level.isOutOfLevel(lem.y)) {
                return LemmingStateType.FALLING;
            }

            if (!this.digRow(level, lem, lem.y - 1)) {
                return LemmingStateType.FALLING;
            }

        }
        return LemmingStateType.NO_STATE_TYPE;
    }


    private digRow(level: Level, lem: Lemming, y: number): boolean {
        let removeCount: number = 0;

        for (let x = lem.x - 4; x < lem.x + 5; x++) {
            if (level.hasGroundAt(x, y)) {
                level.clearGroundAt(x, y);
                removeCount++;
            }
        }

        return (removeCount > 0);
    }
}
