
module Lemmings {
    export class GameVictoryCondition {

        private needCount: number;
        private releaseCount: number;
        private minReleaseRate: number;
        private releaseRate: number;
        private survivorCount : number;
        private leftCount : number;
        private outCount:number;

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

        public GetSurvivorsCount(): number {
            return this.survivorCount;
        }

        public AddSurvivor():void {
            this.survivorCount++;
        }

        public GetSurvivorPercentage():number {
            return Math.floor(this.survivorCount / this.releaseCount * 100);
        }


        public GetOutCount():number {
            return this.outCount;
        }

        public GetLeftCount() :number {
            return this.leftCount;
        }

        public ReleaseOne() :void {
            this.leftCount--;
            this.outCount++;
        }
        public RemoveOne() :void {
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