module Lemmings {

    export class ActionFallSystem implements ActionSystem {

        public soundSystem;

        private sprite:Animation[] = [];
        
        constructor(sprites:LemmingsSprite){
            this.sprite.push(sprites.getAnimation(SpriteType.FALLING, false));
            this.sprite.push(sprites.getAnimation(SpriteType.FALLING, true));
        }



        public process(level:Level, lem: Lemming) {

            lem.frame++;
            if (lem.fall_distance > 16 && (lem.hasParachute)) {
                lem.setAction(ActionType.FLOATING);
                return 1;
            }

            // fall down!
            let i;
            for (i = 0; i < 3; i++) {

                if (level.has_pixel_at(lem.x, lem.y + i)) {
                    break;
                }
            }

            lem.y += i;
            if (i == 3) {
                lem.fall_distance += i;
                return 1;
            } else {
                // landed
                if (lem.fall_distance > Lemming.LEM_MAX_FALLING) {
                    lem.setAction(ActionType.SPLATTING);
                    return 1;
                }
                lem.setAction(ActionType.WALKING);
                return 1;
            }
        }

    }

}
