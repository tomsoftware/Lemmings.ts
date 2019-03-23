module Lemmings {

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

        /** define a factor to speed up >1 or slow down <1 the game */
        public get speedFactor():number {
            return this._speedFactor;
        }

        /** set a factor to speed up >1 or slow down <1 the game */
        public set speedFactor(newSpeedFactor:number) {
            this._speedFactor = newSpeedFactor;
        }

        /** event raising on every tick (one step in time) the game made */
        public onGameTick = new EventHandler<void>();


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
            this.onGameTick.dispose();
        }

        /** toggle between suspend and continue */
        public toggle() {
            if (this.gameTimerHandler == 0) {
                this.continue();
            } else {
                this.suspend();
            }
        }

        /** Run the game timer */
        public continue() {
            if (this.gameTimerHandler != 0) return;

            this.gameTimerHandler = setInterval(() => {
                this.tick();
            }, (this.TIME_PER_FRAME_MS / this._speedFactor));
        }

        /** run the game one step in time */
        public tick() {
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
}