module Lemmings {

    export class ActionJumpSystem implements IActionSystem {

        public soundSystem = new SoundSystem();

        private sprite: Animation[] = [];

        constructor(sprites: LemmingsSprite) {
            this.sprite.push(sprites.getAnimation(SpriteTypes.FALLING, false));
            this.sprite.push(sprites.getAnimation(SpriteTypes.FALLING, true));
        }

        public getActionName(): string {
            return "jump";
        }

        public triggerLemAction(lem: Lemming): boolean {
            return false;
        }

        public draw(gameDisplay: DisplayImage, lem: Lemming) {
            let ani = this.sprite[(lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public process(level: Level, lem: Lemming): LemmingStateType {

            lem.frameIndex++;

            let i = 0;
            for (; i < 2; i++) {
                if (!level.hasGroundAt(lem.x, lem.y + i - 1)) { // really -1?
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