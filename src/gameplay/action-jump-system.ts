module Lemmings {

    export class ActionJumpSystem implements IActionSystem {

        public soundSystem;

        private sprite: Animation[] = [];

        constructor(sprites: LemmingsSprite) {
            this.sprite.push(sprites.getAnimation(SpriteType.FALLING, false));
            this.sprite.push(sprites.getAnimation(SpriteType.FALLING, true));
        }

        public getActionName(): string {
            return "jump";
        }



        public draw(gameDisplay:GameDisplay, lem: Lemming) {
            let ani = this.sprite[ (lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frame);

            gameDisplay.drawImage(frame, lem.x, lem.y);
        }


        public process(level: Level, lem: Lemming): LemmingStateType {

            lem.frame++;

            let i = 0;
            for (; i < 2; i++) {
                if (!level.has_pixel_at(lem.x, lem.y + i - 1)) { // really -1?
                    break;
                }
            }
            lem.y -= i;
            if (i < 2) {
                return LemmingStateType.WALKING;
            }

            return LemmingStateType.NO_STATE_TYPE; // this.check_top_collision(lem);
        }

    }
}