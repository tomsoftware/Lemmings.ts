
module Lemmings {
    export class GameVictoryCondition {

        private needCount: number;
        private releaseCount: number;
        private minReleaseRate: number;
        private releaseRate: number;
        private survivorCount: number;
        private leftCount: number;
        private outCount: number;

        public GetNeedCount(): number {
            return this.needCount;
        }

        public GetReleaseCount(): number {
            return this.releaseCount;
        }

        public GetMinReleaseRate(): number {
            return this.minReleaseRate;
        }

        public GetCurrentReleaseRate(): number {
            return this.releaseRate;
        }

        /** one lemming reached the exit */
        public AddSurvivor(): void {
            this.survivorCount++;
        }

        /** number of rescued lemmings */
        public GetSurvivorsCount(): number {
            return this.survivorCount;
        }

        /** number of rescued lemmings in percentage */
        public GetSurvivorPercentage(): number {
            return Math.floor(this.survivorCount / this.releaseCount * 100);
        }

        /** number of alive lemmings out in the level */
        public GetOutCount(): number {
            return this.outCount;
        }

        /** the number of lemmings not yet released */
        public GetLeftCount(): number {
            return this.leftCount;
        }

        /** release one new lemming */
        public ReleaseOne(): void {
            this.leftCount--;
            this.outCount++;
        }

        /** if a lemming die */
        public RemoveOne(): void {
            this.outCount--;
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