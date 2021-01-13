import { Level } from '../resources/level';
import { Lemming } from './lemming';
import { LemmingStateType } from './lemming-state-type';

export interface IActionSystem {

    /** process a Lemming, if the ActionType change, the new ActionType is returned  */
    process(level: Level, lem: Lemming): LemmingStateType;

    /** return the name of this ActionSystem */
    getActionName(): string;

    /** render a Lemmings to the GameDisplay */
    draw(gameDisplay: DisplayImage, lem: Lemming): void;

    /** trigger a action by the player */
    triggerLemAction(lem : Lemming): boolean;
}

