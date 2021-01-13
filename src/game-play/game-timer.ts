import { Level } from '../resources/level';
import { EventHandler } from '../utilities/event-handler';

export class GameTimer {
    readonly TIME_PER_FRAME_MS: number = 60;

    private _speedFactor: number = 1;

    private gameTimerHandler: number = 0;

    /** the current game time in number of steps the game has made  */
    private tickIndex: number = 0;
    private ticksTimeLimit: number;

    constructor(level: Level) {
        this.ticksTimeLimit = this.secondsToTicks(level.timeLimit * 60);
    }

    /** return if the game timer is running or not */
    public isRunning(): boolean {
        return (this.gameTimerHandler != 0);
    }

    /** define a factor to speed up >1 or slow down <1 the game */
    public get speedFactor(): number {
        return this._speedFactor;
    }

    /** set a factor to speed up >1 or slow down <1 the game */
    public set speedFactor(newSpeedFactor: number) {
        this._speedFactor = newSpeedFactor;

        if (!this.isRunning()) {
            return;
        }

        this.suspend();
        this.continue();
    }

    /** event raising on every tick (one step in time) the game made */
    public onGameTick = new EventHandler<void>();

    /** event raising on before every tick (one step in time) the game made */
    public onBeforeGameTick = new EventHandler<number>();

    /** Pause the game */
    public suspend() {
        if (this.gameTimerHandler != 0) {
            clearInterval(this.gameTimerHandler);
        }
        this.gameTimerHandler = 0;
    }

    /** End the game */
    public stop() {
        this.suspend();
        this.onBeforeGameTick.dispose();
        this.onGameTick.dispose();
    }

    /** toggle between suspend and continue */
    public toggle() {
        if (this.isRunning()) {
            this.suspend();
        } else {
            this.continue();
        }
    }

    /** Run the game timer */
    public continue() {

        if (this.isRunning()) {
            return;
        }

        this.gameTimerHandler = setInterval(() => {
            this.tick();
        }, (this.TIME_PER_FRAME_MS / this._speedFactor));
    }

    /** run the game one step in time */
    public tick() {
        if (this.onBeforeGameTick != null) this.onBeforeGameTick.trigger(this.tickIndex);
        this.tickIndex++;
        if (this.onGameTick != null) this.onGameTick.trigger();
    }

    /** return the past game time in seconds */
    public getGameTime(): number {
        return Math.floor(this.ticksToSeconds(this.tickIndex));
    }

    /** return the past game time in ticks */
    public getGameTicks(): number {
        return this.tickIndex;
    }

    /** return the left game time in seconds */
    public getGameLeftTime(): number {
        let leftTicks = this.ticksTimeLimit - this.tickIndex;
        if (leftTicks < 0) leftTicks = 0;

        return Math.floor(this.ticksToSeconds(leftTicks));
    }

    /** return the left game time in seconds */
    public getGameLeftTimeString(): string {
        let leftSeconds = this.getGameLeftTime();
        let secondsStr = "0" + Math.floor(leftSeconds % 60);

        return Math.floor(leftSeconds / 60) + "-" + secondsStr.substr(secondsStr.length - 2, 2);
    }

    /** convert a game-ticks-time to in game-seconds. Returns Float */
    public ticksToSeconds(ticks: number): number {
        return ticks * (this.TIME_PER_FRAME_MS / 1000);
    }

    /** calc the number ticks form game-time in seconds  */
    public secondsToTicks(seconds: number): number {
        return seconds * (1000 / this.TIME_PER_FRAME_MS);
    }

    /** return the maximum time in seconds to win the game  */
    public getGameTimeLimit(): number {
        return this.ticksTimeLimit;
    }

}
