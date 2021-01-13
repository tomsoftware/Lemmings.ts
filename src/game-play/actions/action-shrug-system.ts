module Lemmings {

    export class ActionShrugSystem implements IActionSystem {

        public soundSystem = new SoundSystem();

        private sprite: Animation[] = [];

        constructor(sprites: LemmingsSprite) {

            this.sprite.push(sprites.getAnimation(SpriteTypes.SHRUGGING, false));
            this.sprite.push(sprites.getAnimation(SpriteTypes.SHRUGGING, true));
        }

        public getActionName(): string {
            return "shruging";
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

            if (lem.frameIndex >= 8) {
                return LemmingStateType.WALKING;
            }

            return LemmingStateType.NO_STATE_TYPE;

        }


    }

}
