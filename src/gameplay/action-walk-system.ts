/// <reference path="../resources/lemmings-sprite.ts"/>

module Lemmings {

    export class ActionWalkSystem implements ActionSystem {

        public soundSystem;
        private sprite:Animation[] = [];

        constructor(sprites:LemmingsSprite){
            this.sprite.push(sprites.getAnimation(SpriteType.WALKING, false));
            this.sprite.push(sprites.getAnimation(SpriteType.WALKING, true));

        }


        public draw(lem: Lemming) {
            let ani = this.sprite[ (lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frame);

            return frame;
        }


        
        public process(level:Level, lem: Lemming) {

            lem.frame++;
            lem.x += (lem.lookRight ? 1 : -1);

            if (lem.x < 0) {
                lem.lookRight = true;
                return 1;
            }

            if (level.has_pixel_at(lem.x, lem.y)) {
                // walk, jump, climb, or turn
                let i;
                for (i = 1; i < 8; i++) {
                    if (!level.has_pixel_at(lem.x, lem.y - i)) {
                        break;
                    }
                }

                // collision with obstacle
                if (i == 8) {
                    if (lem.canClimb) {
                        // start climbing
                        lem.setAction(ActionType.CLIMBING);
                    } else {
                        // turn around
                        lem.lookRight = !lem.lookRight;
                    }
                    return 1;
                }
                if (i > 3) {
                    // jump
                    lem.setAction(ActionType.JUMPING);
                    lem.y -= 2;
                } else {
                    // just walk
                    lem.y -= i - 1;
                }

                // test for collision with top of level
                // todo: this.check_top_collision();
                return 1;
                
            } else {
                // walk or fall
                let i;
                for (i = 1; i < 4; i++) {
                    if (level.has_pixel_at(lem.x, lem.y + i)) {
                        break;
                    }
                }
                lem.y += i;
                if (i == 4) {
                    lem.setAction(ActionType.FALLING);
                }

                if (level.isOutOfLevel(lem.y)) {
                    // play sound: fall out of level
                    this.soundSystem.play_sound(lem, 0x13);
                    lem.removed = true;
                    return 0;
                }
                
            }

            return 1;
        }

    }

}