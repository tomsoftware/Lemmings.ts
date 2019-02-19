/// <reference path="../resources/lemmings-sprite.ts"/>

module Lemmings {

    export class ActionWalkSystem implements IActionSystem {

        public soundSystem;
        private sprite:Animation[] = [];

        constructor(sprites:LemmingsSprite){
            this.sprite.push(sprites.getAnimation(SpriteTypes.WALKING, false));
            this.sprite.push(sprites.getAnimation(SpriteTypes.WALKING, true));

        }


        public draw(gameDisplay:DisplayImage, lem: Lemming) {
            let ani = this.sprite[ (lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public getActionName() : string {
            return "walk";
        }

        private getGroundStepDelta(groundMask:SolidLayer, x:number, y:number):number {
            for (let i = 0; i < 8; i++) {
                if (!groundMask.hasGroundAt(x, y - i)) {
                    return i;
                }
            }
            return 8;
        }

        private getGroudGapDelta(groundMask:SolidLayer, x:number, y:number):number {
            for (let i = 1; i < 4; i++) {
                if (groundMask.hasGroundAt(x, y + i)) {
                    return i;
                }
            }
            return 4;
        }
        
        public process(level:Level, lem: Lemming) {

            lem.frameIndex++;
            lem.x += (lem.lookRight ? 1 : -1);

            let groundMask = level.getGroundMaskLayer();

            if (lem.x < 0) {
                lem.lookRight = true;
                return LemmingStateType.NO_STATE_TYPE;
            }

            let delta = this.getGroundStepDelta(groundMask, lem.x, lem.y);
            
            
            if (delta == 8) {
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
            else if (delta > 3) {
                // jump
                lem.y -= 2;
                return LemmingStateType.JUMPING;;
            }
            else if (delta > 0) {
                // just walk
                lem.y -= delta - 1;
                return LemmingStateType.NO_STATE_TYPE; 
            } 
            else {
                // walk or fall
                let gapDelta = this.getGroudGapDelta(groundMask, lem.x, lem.y);

                lem.y += gapDelta;

                if (gapDelta == 4) {
                    return LemmingStateType.FALLING;
                }
                
                return LemmingStateType.NO_STATE_TYPE;
                //if (level.isOutOfLevel(lem.y)) {
                //    // play sound: fall out of level
                //    this.soundSystem.play_sound(lem, 0x13);
                //    lem.removed = true;
                //    return LemmingStateType.OUT_OFF_LEVEL;
                //}
                
            }

        }

    }

}
