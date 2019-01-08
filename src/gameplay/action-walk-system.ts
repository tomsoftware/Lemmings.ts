/// <reference path="../resources/lemmings-sprite.ts"/>

module Lemmings {

    export class ActionWalkSystem implements IActionSystem {

        public soundSystem;
        private sprite:Animation[] = [];

        constructor(sprites:LemmingsSprite){
            this.sprite.push(sprites.getAnimation(SpriteType.WALKING, false));
            this.sprite.push(sprites.getAnimation(SpriteType.WALKING, true));

        }


        public draw(gameDisplay:DisplayImage, lem: Lemming) {
            let ani = this.sprite[ (lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public getActionName() : string {
            return "walk";
        }


        
        public process(level:Level, lem: Lemming) {

            lem.frameIndex++;
            lem.x += (lem.lookRight ? 1 : -1);

            let newAction:LemmingStateType = LemmingStateType.NO_STATE_TYPE;

            if (lem.x < 0) {
                lem.lookRight = true;
                return LemmingStateType.NO_STATE_TYPE;
            }

            if (level.hasGroundAt(lem.x, lem.y)) {
                // walk, jump, climb, or turn
                let i;
                for (i = 1; i < 8; i++) {
                    if (!level.hasGroundAt(lem.x, lem.y - i)) {
                        break;
                    }
                }

                // collision with obstacle
                if (i == 8) {
                    if (lem.canClimb) {
                        // start climbing
                        newAction = LemmingStateType.CLIMBING;
                    } else {
                        // turn around
                        lem.lookRight = !lem.lookRight;
                    }
                    return 1;
                }
                if (i > 3) {
                    // jump
                    newAction = LemmingStateType.JUMPING;
                    lem.y -= 2;
                } else {
                    // just walk
                    lem.y -= i - 1;
                }

                // test for collision with top of level
                // todo: this.check_top_collision();
                return newAction; //ActionType.OUT_OFF_LEVEL;
                
            } else {
                // walk or fall
                let i;
                for (i = 1; i < 4; i++) {
                    if (level.hasGroundAt(lem.x, lem.y + i)) {
                        break;
                    }
                }
                lem.y += i;
                if (i == 4) {
                    newAction = LemmingStateType.FALLING;
                }

                if (level.isOutOfLevel(lem.y)) {
                    // play sound: fall out of level
                    this.soundSystem.play_sound(lem, 0x13);
                    lem.removed = true;
                    return LemmingStateType.OUT_OFF_LEVEL;
                }
                
            }

            return newAction;
        }

    }

}
