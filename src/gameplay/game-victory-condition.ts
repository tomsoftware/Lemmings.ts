
module Lemmings {

    /// Handels the number of lemmings
    ///  - needed to win or lose the game
    ///  - release rate
    export class GameVictoryCondition {

        private static readonly maxReleaseRate = 99;
        private needCount: number;
        private releaseCount: number;
        private minReleaseRate: number;
        private releaseRate: number;
        private survivorCount: number;
        private leftCount: number;
        private outCount: number;

        public getNeedCount(): number {
            return this.needCount;
        }

        public getReleaseCount(): number {
            return this.releaseCount;
        }

        public changeReleaseRate(count: number):boolean {
            let oldReleaseRate = this.releaseRate;
            let newReleaseRate = this.boundToRange(this.minReleaseRate, this.releaseRate + count, GameVictoryCondition.maxReleaseRate);

            if (newReleaseRate == oldReleaseRate) {
                return false;
            }

            this.releaseRate = newReleaseRate;

            return true;
        }

        private boundToRange(min: number, value: number, max: number): number {
            return Math.min(max, Math.max(min, value | 0)) | 0;
        }

        public getMinReleaseRate(): number {
            return this.minReleaseRate;
        }

        public getCurrentReleaseRate(): number {
            return this.releaseRate;
        }

        /** one lemming reached the exit */
        public addSurvivor(): void {
            this.survivorCount++;
        }

        /** number of rescued lemmings */
        public getSurvivorsCount(): number {
            return this.survivorCount;
        }

        /** number of rescued lemmings in percentage */
        public getSurvivorPercentage(): number {
            return Math.floor(this.survivorCount / this.releaseCount * 100) | 0;
        }

        /** number of alive lemmings out in the level */
        public getOutCount(): number {
            return this.outCount;
        }

        /** the number of lemmings not yet released */
        public getLeftCount(): number {
            return this.leftCount;
        }

        /** release one new lemming */
        public releaseOne(): void {
            this.leftCount--;
            this.outCount++;
        }

        /** if a lemming die */
        public removeOne(): void {
            this.outCount--;
        }

        /** stop releasing lemmings */
        public doNuke() {
            this.leftCount = 0;
        }

        constructor(level: Level) {
            this.needCount = level.needCount;

            this.releaseCount = level.releaseCount;
            this.leftCount = level.releaseCount;

            this.minReleaseRate = level.releaseRate;
            this.releaseRate = level.releaseRate;

            this.survivorCount = 0;
            this.outCount = 0;

        }
    }
}