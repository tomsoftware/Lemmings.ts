module Lemmings {

    /** manages all triggers */
    export class TriggerManager {
        private triggers: Trigger[] = [];

        constructor(private gameTimer:GameTimer) {

        }

        /** add a new trigger to the manager */
        public add(trigger: Trigger) {
            this.triggers.push(trigger);
        }

        public addRange(triggers: Trigger[]) {
            for (let i = 0; i < triggers.length; i++) {
                this.triggers.push(triggers[i]);
            }
        }

        /** test all triggers. Returns the triggered type that matches */
        trigger(x: number, y: number): TriggerTypes {
            let l = this.triggers.length;
            let tick = this.gameTimer.getGameTicks();

            for (var i = 0; i < l; i++) {
                let type = this.triggers[i].trigger(x, y, tick);

                if (type != TriggerTypes.NO_TRIGGER) return type;
            }

            return TriggerTypes.NO_TRIGGER;
        }

    }
}