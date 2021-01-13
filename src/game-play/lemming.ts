import { Level } from '../resources/level';
import { DisplayImage } from '../view/display-image';
import { IActionSystem } from './action-system';
import { LemmingStateType } from './lemming-state-type';

export class Lemming {
    public static readonly LEM_MIN_Y = -5;
    public static readonly LEM_MAX_FALLING = 60

    public x: number = 0;
    public y: number = 0;
    public lookRight = true;
    public frameIndex: number = 0;
    public canClimb: boolean = false;
    public hasParachute: boolean = false;
    public removed: boolean = false;
    public countdown: number = 0;
    public action: IActionSystem | null = null;
    public countdownAction: IActionSystem | null = null;
    public state: number = 0;
    public id: number;
    private disabled: boolean = false;

    constructor(x: number, y: number, id: number) {
        this.x = x;
        this.y = y;
        this.id = id;
    }

    /** return the number shown as countdown */
    public getCountDownTime(): number {
        return (8 - (this.countdown >> 4));
    }

    /** switch the action of this lemming */
    public setAction(action: IActionSystem) {
        this.action = action;
        this.frameIndex = 0;
        this.state = 0;
    }

    /** set the countdown action of this lemming */
    public setCountDown(action: IActionSystem | null): boolean {
        this.countdownAction = action;

        if (this.countdown > 0) {
            return false;
        }

        this.countdown = 80;

        return true;
    }

    /** return the distance of this lemming to a given position */
    public getClickDistance(x: number, y: number): number {
        let yCenter = this.y - 5;
        let xCenter = this.x;

        let x1 = xCenter - 5;
        let y1 = yCenter - 6;
        let x2 = xCenter + 5;
        let y2 = yCenter + 7;

        //console.log(this.id + ' : '+ x1 +'-'+ x2 +'  '+ y1 +'-'+ y2);

        if ((x >= x1) && (x <= x2) && (y >= y1) && (y < y2)) {
            return ((yCenter - y) * (yCenter - y) + (xCenter - x) * (xCenter - x));
        }

        return -1;
    }

    /** render this lemming to the display */
    public render(gameDisplay: DisplayImage): void {
        if (!this.action) {
            return;
        }

        if (this.countdownAction) {
            this.countdownAction.draw(gameDisplay, this);
        }

        this.action.draw(gameDisplay, this);
    }


    /** render this lemming debug 'information' to the display */
    public renderDebug(gameDisplay: DisplayImage): void {
        if (!this.action) {
            return;
        }

        gameDisplay.setDebugPixel(this.x, this.y)
    }

    /** process this lemming one tick in time */
    public process(level: Level): LemmingStateType {

        if ((this.x < 0) || (this.x >= level.width) || (this.y < 0) || (this.y >= level.height + 6)) {
            return LemmingStateType.OUT_OFF_LEVEL;
        }

        /// run main action
        if (!this.action) {
            return LemmingStateType.OUT_OFF_LEVEL;
        }

        /// run secondary action
        if (this.countdownAction) {
            let newAction = this.countdownAction.process(level, this);

            if (newAction != LemmingStateType.NO_STATE_TYPE) {
                return newAction;
            }
        }

        if (this.action) {
            return this.action.process(level, this);
        }

        return LemmingStateType.NO_STATE_TYPE;
    }


    /** disable this lemming so it can not longer be triggered 
     *   or being selected by the user */
    public disable(): void {
        this.disabled = true;
    }

    /** remove this lemming */
    public remove(): void {
        this.action = null;
        this.countdownAction = null;
        this.removed = true;
    }

    public isDisabled(): boolean {
        return this.disabled;
    }

    public isRemoved(): boolean {
        return (this.action == null);
    }

}
