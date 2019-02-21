module Lemmings {

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
        public action: IActionSystem;
        public state: number = 0;
        public id: string;

        public setAction(action: IActionSystem) {
            this.action = action;
            this.frameIndex = 0;
            this.state = 0;
        }

    }
}