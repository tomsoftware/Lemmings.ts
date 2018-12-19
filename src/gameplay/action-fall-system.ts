module Lemmings {

    export class ActionFallSystem implements IActionSystem {

        public soundSystem;

        private sprite:Animation[] = [];
        
        constructor(sprites:LemmingsSprite){
            this.sprite.push(sprites.getAnimation(SpriteType.FALLING, false));
            this.sprite.push(sprites.getAnimation(SpriteType.FALLING, true));
        }

        public getActionName() : string {
            return "fall";
        }


        /** render Leming to gamedisply */
        public draw(gameDisplay:GameDisplay, lem: Lemming) {
            let ani = this.sprite[ (lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frame);

            gameDisplay.drawImage(frame, lem.x, lem.y);
        }



        public process(level:Level, lem: Lemming):ActionType {

            lem.frame++;
            if (lem.state > 16 && (lem.hasParachute)) {
                return ActionType.FLOATING;
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
                lem.state += i;
                return ActionType.NO_ACTION_TYPE;
            } else {
                // landed
                if (lem.state > Lemming.LEM_MAX_FALLING) {
                    return ActionType.SPLATTING;
                }
                return ActionType.WALKING;
            }

        }

    }

}
