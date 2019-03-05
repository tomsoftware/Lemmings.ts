module Lemmings {

    export class ActionOhNoSystem implements IActionSystem {

        public soundSystem = new SoundSystem();

        private sprite: Animation;

        constructor(sprites: LemmingsSprite) {
            this.sprite = sprites.getAnimation(SpriteTypes.OHNO, false);
        }

        public getActionName(): string {
            return "oh-no";
        }

        public triggerLemAction(lem: Lemming): boolean {
            return false;
        }

        /** render Leming to gamedisply */
        public draw(gameDisplay: DisplayImage, lem: Lemming) {
            let frame = this.sprite.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public process(level: Level, lem: Lemming): LemmingStateType {

            lem.frameIndex++;

            if (lem.frameIndex == 16) {
                // play sound: explosion
                return LemmingStateType.EXPLODING;
            }

            // fall down!
            for (let i = 0; i < 3; i++) {
                if (!level.hasGroundAt(lem.x, lem.y + 1)) {
                    lem.y++;
                    break;
                }
            }

            return LemmingStateType.NO_STATE_TYPE;

        }

    }

}
