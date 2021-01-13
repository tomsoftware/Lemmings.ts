module Lemmings {

    export class ActionFallSystem implements IActionSystem {

        public soundSystem = new SoundSystem();

        private sprite: Animation[] = [];

        constructor(sprites: LemmingsSprite) {
            this.sprite.push(sprites.getAnimation(SpriteTypes.FALLING, false));
            this.sprite.push(sprites.getAnimation(SpriteTypes.FALLING, true));
        }

        public getActionName(): string {
            return "falling";
        }

        public triggerLemAction(lem: Lemming): boolean {
            return false;
        }


        /** render Lemming to gamedisply */
        public draw(gameDisplay: DisplayImage, lem: Lemming) {
            let ani = this.sprite[(lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public process(level: Level, lem: Lemming): LemmingStateType {

            lem.frameIndex++;
            if (lem.state > 16 && (lem.hasParachute)) {
                return LemmingStateType.FLOATING;
            }

            // fall down!
            let i: number = 0;
            for (; i < 3; i++) {
                if (level.hasGroundAt(lem.x, lem.y + i)) {
                    break;
                }
            }

            lem.y += i;
            if (i == 3) {
                lem.state += i;
                return LemmingStateType.NO_STATE_TYPE;

            } else {
                // landed
                if (lem.state > Lemming.LEM_MAX_FALLING) {
                    return LemmingStateType.SPLATTING;
                }
                
                return LemmingStateType.WALKING;
            }

        }

    }

}
