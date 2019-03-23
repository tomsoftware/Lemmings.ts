module Lemmings {

    /** manages all triggers */
    export class TriggerManager {

        private triggers: Trigger[] = [];

        constructor(private gameTimer: GameTimer) {

        }

        /** add a new trigger to the manager */
        public add(trigger: Trigger) {
            this.triggers.push(trigger);
        }

        /** remove all triggers having a giving owner */
        public removeByOwner(owner: any): void {
            let triggerIndex = (this.triggers.length - 1);

            while (triggerIndex >= 0) {
                triggerIndex = this.triggers.findIndex((t) => t.owner == owner);
                if (triggerIndex >= 0) {
                    this.triggers.splice(triggerIndex, 1);
                }
            }

        }

        /** add a new trigger to the manager */
        public remove(trigger: Trigger) {
            let triggerIndex = this.triggers.indexOf(trigger);

            this.triggers.splice(triggerIndex, 1);
        }

        public addRange(newTriggers: Trigger[]) {
            for (let i = 0; i < newTriggers.length; i++) {
                this.triggers.push(newTriggers[i]);
            }
        }

        public render(gameDisplay: DisplayImage) {
            for (let i = 0; i < this.triggers.length; i++) {
                this.triggers[i].draw(gameDisplay);
            }
        }

        /** test all triggers. Returns the triggered type that matches */
        trigger(x: number, y: number): TriggerTypes {
            let l = this.triggers.length;
            let tick = this.gameTimer.getGameTicks();

            for (var i = 0; i < l; i++) {
                let type = this.triggers[i].trigger(x, y, tick);

                if (type != TriggerTypes.NO_TRIGGER)
                    return type;
            }

            return TriggerTypes.NO_TRIGGER;
        }

    }
}