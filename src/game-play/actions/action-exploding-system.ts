module Lemmings {

    export class ActionExplodingSystem implements IActionSystem {

        public soundSystem = new SoundSystem();

        private mask: MaskList;
        private sprite: Animation;

        constructor(sprites: LemmingsSprite, masks: MaskProvider, private triggerManager: TriggerManager, private particleTable:ParticleTable) {
            this.mask = masks.GetMask(MaskTypes.EXPLODING);
            this.sprite = sprites.getAnimation(SpriteTypes.EXPLODING, false);
        }

        public getActionName(): string {
            return "exploding";
        }

        public triggerLemAction(lem: Lemming): boolean {
            return false;
        }

        /** render Lemming to gamedisply */
        public draw(gameDisplay: DisplayImage, lem: Lemming) {

            if (lem.frameIndex == 0) {
                let frame = this.sprite.getFrame(lem.frameIndex);
                gameDisplay.drawFrame(frame, lem.x, lem.y);
            }
            else {
                this.particleTable.draw(gameDisplay, lem.frameIndex - 1, lem.x, lem.y);
            }


        }


        public process(level: Level, lem: Lemming): LemmingStateType {
            lem.disable();

            lem.frameIndex++;

            if (lem.frameIndex == 1) {
                this.triggerManager.removeByOwner(lem);

                level.clearGroundWithMask(this.mask.GetMask(0), lem.x, lem.y);
            }

            if (lem.frameIndex == 52) {
                return LemmingStateType.OUT_OFF_LEVEL;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }


    }

}



