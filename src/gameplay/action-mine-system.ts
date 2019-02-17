/// <reference path="../resources/lemmings-sprite.ts"/>

module Lemmings {

    export class ActionMineSystem implements IActionSystem {

        public soundSystem = new SoundSystem();
        private sprite:Animation[] = [];
        private masks:MaskList[] = [];

        constructor(sprites:LemmingsSprite, masks:MaskProvider){
            this.sprite.push(sprites.getAnimation(SpriteTypes.MINEING, false));
            this.sprite.push(sprites.getAnimation(SpriteTypes.MINEING, true));

            this.masks.push(masks.GetMask(MaskTypes.MINEING_L));
            this.masks.push(masks.GetMask(MaskTypes.MINEING_R));
        }


        
        public draw(gameDisplay:DisplayImage, lem: Lemming) {
            let ani = this.sprite[ (lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public getActionName() : string {
            return "mining";
        }


        
        public process(level:Level, lem: Lemming):LemmingStateType {

          //  let index =           lem.frameIndex;
          let index =  lem.frameIndex  = (lem.frameIndex + 1) % 24;

            let maskFrameIndex = 0;

            switch(lem.frameIndex) {
                case 2:
                    maskFrameIndex = 1;
                case 1:
                    let mask = this.masks[ (lem.lookRight ? 1 : 0)];

                    level.clearGroundWithMask(mask.GetMask(maskFrameIndex), lem.x, lem.y);
                    break;
                case 3:
                    lem.y++;

                case 15:
                    lem.x += lem.lookRight ? 1 : -1;

                    if (!level.groundMask.hasGroundAt(lem.x, lem.y)) {
                        return LemmingStateType.FALLING;
                    }
                    break;
            }

            return LemmingStateType.NO_STATE_TYPE;
        }

    }

}
