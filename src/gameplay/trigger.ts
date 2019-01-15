module Lemmings {


    /** A trigger that can be hit by a lemming */
    export class Trigger {
        private id: number = 0;
        private x1: number = 0;
        private y1: number = 0;
        private x2: number = 0;
        private y2: number = 0;
        private type: TriggerTypes = TriggerTypes.NO_TRIGGER;
        private disableTicksCount: number = 0;
        private disabledUntisTick: number = 0;
        private soundIndex:number;

        constructor(type: TriggerTypes, x1:number, y1: number, x2:number, y2:number, disableTicksCount:number = 0, soundIndex:number = -1) {
            this.type = type;
            this.x1=x1;
            this.y1=y1;
            this.x2=x2;
            this.y2=y2;
            this.disableTicksCount = disableTicksCount;
            this.soundIndex = soundIndex;
        }


        public trigger(x: number, y: number, tick: number): TriggerTypes {
            if (this.disabledUntisTick <= tick) {
                if ((x >= this.x1) && (y >= this.y1) && (x <= this.x2) && (y <= this.y2)) {
                    this.disabledUntisTick = tick + this.disableTicksCount;
                    return this.type;
                }
            }

            return TriggerTypes.NO_TRIGGER;
        }


    }
}