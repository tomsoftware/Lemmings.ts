module Lemmings {

    export class ActionExitingSplatter implements IActionSystem {

        public soundSystem = new SoundSystem();

        private sprite: Animation;

        constructor(sprites: LemmingsSprite) {
            this.sprite = sprites.getAnimation(SpriteTypes.SPLATTING, false);
        }

        public getActionName(): string {
            return "splatter";
        }

        public triggerLemAction(lem: Lemming): boolean {
            return false;
        }
        
        public draw(gameDisplay: DisplayImage, lem: Lemming) {

            let frame = this.sprite.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public process(level: Level, lem: Lemming): LemmingStateType {
            lem.disable();
            
            lem.frameIndex++;

            if (lem.frameIndex >= 16) {
                return LemmingStateType.OUT_OFF_LEVEL;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }

    }
}