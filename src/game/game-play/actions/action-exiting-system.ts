import { LemmingsSprite } from '@/game/resources/lemmings-sprite';
import { Level } from '@/game/resources/level';
import { SpriteTypes } from '@/game/resources/sprite-types';
import { DisplayImage } from '@/game/view/display-image';
import { IActionSystem } from '../action-system';
import { GameVictoryCondition } from '../game-victory-condition';
import { Lemming } from '../lemming';
import { LemmingStateType } from '../lemming-state-type';
import { SoundSystem } from '../sound-system';
import { Animation } from './../../resources/animation';

export class ActionExitingSystem implements IActionSystem {

    public soundSystem = new SoundSystem();

    private sprite: Animation;

    constructor(sprites: LemmingsSprite, private gameVictoryCondition: GameVictoryCondition) {
        this.sprite = sprites.getAnimation(SpriteTypes.EXITING, false);
    }

    public getActionName(): string {
        return 'exiting';
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
        lem.disable();

        lem.frameIndex++;

        if (lem.frameIndex >= 8) {
            this.gameVictoryCondition.addSurvivor();

            return LemmingStateType.OUT_OFF_LEVEL;
        }

        return LemmingStateType.NO_STATE_TYPE;
    }

}
