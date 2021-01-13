import { TriggerTypes } from '../resources/lemmings/trigger-types';
import { DisplayImage } from '../view/display-image';

/** A trigger that can be hit by a lemming */
export class Trigger {
    public owner: any = null;
    private x1: number = 0;
    private y1: number = 0;
    private x2: number = 0;
    private y2: number = 0;
    private type: TriggerTypes = TriggerTypes.NO_TRIGGER;
    private disableTicksCount: number = 0;
    private disabledUntilTick: number = 0;
    private soundIndex: number;

    constructor(type: TriggerTypes, x1: number, y1: number, x2: number, y2: number, disableTicksCount: number = 0, soundIndex: number = -1, owner: any = null) {
        this.owner = owner;
        this.type = type;
        this.x1 = Math.min(x1, x2);
        this.y1 = Math.min(y1, y2);
        this.x2 = Math.max(x1, x2);
        this.y2 = Math.max(y1, y2);
        this.disableTicksCount = disableTicksCount;
        this.soundIndex = soundIndex;
    }


    public trigger(x: number, y: number, tick: number): TriggerTypes {
        if (this.disabledUntilTick <= tick) {
            if ((x >= this.x1) && (y >= this.y1) && (x <= this.x2) && (y <= this.y2)) {
                this.disabledUntilTick = tick + this.disableTicksCount;
                return this.type;
            }
        }

        return TriggerTypes.NO_TRIGGER;
    }

    public draw(gameDisplay: DisplayImage) {
        gameDisplay.drawRect(
            this.x1, this.y1,
            this.x2 - this.x1, this.y2 - this.y1,
            255, 0, 0);
    }


}
