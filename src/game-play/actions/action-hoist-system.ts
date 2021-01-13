module Lemmings {

    export class ActionHoistSystem implements IActionSystem {

        public soundSystem = new SoundSystem();

        private sprite: Animation[] = [];

        constructor(sprites: LemmingsSprite) {
            this.sprite.push(sprites.getAnimation(SpriteTypes.POSTCLIMBING, false));
            this.sprite.push(sprites.getAnimation(SpriteTypes.POSTCLIMBING, true));
        }

        public getActionName(): string {
            return "hoist";
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

            if (lem.frameIndex <= 4) {
                lem.y -= 2;
                return LemmingStateType.NO_STATE_TYPE;
            }

            if (lem.frameIndex >= 8) {
                return LemmingStateType.WALKING;;
            }

            return LemmingStateType.NO_STATE_TYPE;

        }

    }

}
