/// <reference path="../resources/lemmings-sprite.ts"/>

module Lemmings {

    export class ActionDiggSystem implements IActionSystem {

        public soundSystem = new SoundSystem();
        private sprite:Animation[] = [];

        constructor(sprites:LemmingsSprite){
            this.sprite.push(sprites.getAnimation(SpriteType.DIGGING, false));
            this.sprite.push(sprites.getAnimation(SpriteType.DIGGING, true));

        }


        public draw(gameDisplay:GameDisplay, lem: Lemming) {
            let ani = this.sprite[ (lem.lookRight ? 1 : 0)];

            let frame = ani.getFrame(lem.frameIndex);

            gameDisplay.drawFrame(frame, lem.x, lem.y);
        }


        public getActionName() : string {
            return "digging";
        }


        
        public process(level:Level, lem: Lemming):LemmingStateType {

            if (lem.state == 0) {
                this.digRow(level, lem, lem.y-2);
                this.digRow(level, lem, lem.y-1);
                lem.state = 1;
            } else {
                lem.frameIndex = (lem.frameIndex + 1) % 16;
            }

            if (!(lem.frameIndex & 0x07)) {
                lem.y++;

                if (level.isOutOfLevel(lem.y)) {
                    // play sound: fall out of level
                    this.soundSystem.playSound(lem, 0x13);
                    lem.removed = true;
                    return LemmingStateType.OUT_OFF_LEVEL;
                }

                if (!this.digRow(level, lem, lem.y-1)) {
                    return LemmingStateType.FALLING;
                }
                //if (level.readobjectmap(level,lem->x, lem->y) == OBJECT_STEEL) {
                    // play sound effect: hitting steel
                   // play_sound(0x0A);
                   // return ActionType.WALKING;
                //}
                
            }
            return LemmingStateType.NO_STATE_TYPE;
        }

        private digRow(level:Level, lem: Lemming, y:number):boolean {
            let removeCount:number = 0;

            for (let x=lem.x-4; x < lem.x + 5; x++) {
                if (level.hasGroundAt(x, y)) {
                    level.clearGroundAt(x,y);
                    removeCount++;
                }
            }

            return (removeCount > 0);
        }
    }

}
