module Lemmings {

    export class ActionMineSystem implements IActionSystem {

        public soundSystem = new SoundSystem();
        private sprite: Animation[] = [];
        private masks: MaskList[] = [];

        constructor(sprites: LemmingsSprite, masks: MaskProvider) {
            this.sprite.push(sprites.getAnimation(SpriteTypes.MINEING, false));
            this.sprite.push(sprites.getAnimation(SpriteTypes.MINEING, true));

            this.masks.push(masks.GetMask(MaskTypes.MINEING_L));
            this.masks.push(masks.GetMask(MaskTypes.MINEING_R));
        }



        public draw(gameDisplay: DisplayImage, lem: Lemming) {
            let ani = this.sprite[(lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public getActionName(): string {
            return "mining";
        }


        public triggerLemAction(lem: Lemming): boolean {
            lem.setAction(this);

            return true;
        }


        public process(level: Level, lem: Lemming): LemmingStateType {

            lem.frameIndex = (lem.frameIndex + 1) % 24;

            switch (lem.frameIndex) {
                case 1:
                case 2:
                    let mask = this.masks[(lem.lookRight ? 1 : 0)];
                    let maskIndex = lem.frameIndex - 1;

                    level.clearGroundWithMask(mask.GetMask(maskIndex), lem.x, lem.y);
                    break;

                case 3:
                    lem.y++;

                case 15:
                    lem.x += lem.lookRight ? 1 : -1;

                    if (!level.hasGroundAt(lem.x, lem.y)) {
                        return LemmingStateType.FALLING;
                    }
                    break;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }

    }

}
