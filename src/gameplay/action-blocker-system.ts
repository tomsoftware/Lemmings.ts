module Lemmings {

    export class ActionBlockerSystem implements IActionSystem {

        public soundSystem = new SoundSystem();

        private sprite: Animation;

        constructor(sprites: LemmingsSprite, private triggerManager: TriggerManager) {
            this.sprite = sprites.getAnimation(SpriteTypes.BLOCKING, false);
        }

        public getActionName(): string {
            return "blocking";
        }

        public draw(gameDisplay: DisplayImage, lem: Lemming) {

            let frame = this.sprite.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public process(level: Level, lem: Lemming): LemmingStateType {

            if (lem.state == 0) {

                let trigger1 = new Trigger(TriggerTypes.BLOCKER_LEFT, lem.x - 6, lem.y + 4, lem.x - 3, lem.y - 10, 0, 0, lem);
                let trigger2 = new Trigger(TriggerTypes.BLOCKER_RIGHT, lem.x + 7, lem.y + 4, lem.x + 4, lem.y - 10, 0, 0, lem);

                this.triggerManager.add(trigger1);
                this.triggerManager.add(trigger2);

                lem.state = 1;
            }

            lem.frameIndex++;
            if (!level.groundMask.hasGroundAt(lem.x, lem.y + 1)) {
                this.triggerManager.removeByOwner(lem);

                return LemmingStateType.FALLING;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }

    }
}