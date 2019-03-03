/// <reference path="../resources/lemmings-sprite.ts"/>

module Lemmings {

    export class ActionWalkSystem implements IActionSystem {

        public soundSystem;
        private sprite: Animation[] = [];

        constructor(sprites: LemmingsSprite) {
            this.sprite.push(sprites.getAnimation(SpriteTypes.WALKING, false));
            this.sprite.push(sprites.getAnimation(SpriteTypes.WALKING, true));

        }


        public draw(gameDisplay: DisplayImage, lem: Lemming) {
            let ani = this.sprite[(lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public getActionName(): string {
            return "walk";
        }

        private getGroundStepDelta(groundMask: SolidLayer, x: number, y: number): number {
            for (let i = 0; i < 8; i++) {
                if (!groundMask.hasGroundAt(x, y - i)) {
                    return i;
                }
            }
            return 8;
        }

        private getGroudGapDelta(groundMask: SolidLayer, x: number, y: number): number {
            for (let i = 1; i < 4; i++) {
                if (groundMask.hasGroundAt(x, y + i)) {
                    return i;
                }
            }
            return 4;
        }

        public process(level: Level, lem: Lemming) {

            lem.frameIndex++;
            lem.x += (lem.lookRight ? 1 : -1);

            let groundMask = level.getGroundMaskLayer();

            let upDelta = this.getGroundStepDelta(groundMask, lem.x, lem.y);

            if (upDelta == 8) {
                // collision with obstacle
                if (lem.canClimb) {
                    // start climbing
                    return LemmingStateType.CLIMBING;
                }
                else {
                    // turn around
                    lem.lookRight = !lem.lookRight;
                    return LemmingStateType.NO_STATE_TYPE;
                }
            }
            else if (upDelta > 0) {
                lem.y -= upDelta - 1;

                if (upDelta > 3) {
                    // jump
                    return LemmingStateType.JUMPING;
                }
                else {
                    // walk with small jump up
                    return LemmingStateType.NO_STATE_TYPE;
                }
            }
            else {
                // walk or fall
                let downDelta = this.getGroudGapDelta(groundMask, lem.x, lem.y);

                lem.y += downDelta;

                if (downDelta == 4) {
                    return LemmingStateType.FALLING;
                }
                else {
                    // walk with small jump down
                    return LemmingStateType.NO_STATE_TYPE;
                }

            }

        }

    }

}
