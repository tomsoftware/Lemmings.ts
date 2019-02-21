/// <reference path="action-base-system.ts"/>

module Lemmings {

    export class ActionBashSystem implements IActionSystem {

        public soundSystem = new SoundSystem();

        private sprite:Animation[] = [];
        private masks:MaskList[] = [];

        constructor(sprites:LemmingsSprite, masks:MaskProvider) {

            this.sprite.push(sprites.getAnimation(SpriteTypes.BASHING, false));
            this.sprite.push(sprites.getAnimation(SpriteTypes.BASHING, true));

            this.masks.push(masks.GetMask(MaskTypes.BASHING_L));
            this.masks.push(masks.GetMask(MaskTypes.BASHING_R));
        }

        public getActionName() : string {
            return "bashing";
        }


        /** render Leming to gamedisply */
        public draw(gameDisplay:DisplayImage, lem: Lemming) {
            let ani = this.sprite[ (lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public process(level:Level, lem: Lemming):LemmingStateType {

            let groundMask = level.getGroundMaskLayer();

            lem.frameIndex = (lem.frameIndex + 1) % 32;

            if ((lem.frameIndex & 0xF) > 10) {
                lem.x += (lem.lookRight ? 1 : -1);

                let i:number = 0;
                for (; i < 3; i++) {
                    if (groundMask.hasGroundAt(lem.x, lem.y + i)) {
                        break;
                    }
                    lem.y++;
                }
                
                if (i == 3) {
                    lem.y++;
                    return LemmingStateType.FALLING;
                }
            }

            if ((lem.frameIndex & 0xF) > 1 && (lem.frameIndex & 0xF) < 6) {
                
                let mask = this.masks[(lem.lookRight ? 1 : 0)];
                let maskIndex = (lem.frameIndex & 0xF) - 2;
                
                level.clearGroundWithMask(mask.GetMask(maskIndex), lem.x, lem.y);

                if (lem.frameIndex == 5) {

                    if (this.findHorizontalSpace(groundMask, lem.x + (lem.lookRight ? 8 : -8), lem.y - 6, lem.lookRight)) {
                        return LemmingStateType.WALKING;
                    }
                }
            }

            return LemmingStateType.NO_STATE_TYPE;
            
        }

        private findHorizontalSpace(map:SolidLayer, x:number, y:number, lookRight:boolean) {
            for (let i=0; i<4; i++) {
                
                if (map.hasGroundAt(x, y)) {
                    return i;
                }
                x += (lookRight ? 1 : -1)
            }
            return 5;
        }

    }

}
