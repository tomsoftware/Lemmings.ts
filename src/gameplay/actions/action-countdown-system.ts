module Lemmings {

    export class ActionCountdownSystem implements IActionSystem {

        public soundSystem = new SoundSystem();

        private numberMasks: MaskList;

        constructor(masks: MaskProvider) {
            this.numberMasks = masks.GetMask(MaskTypes.NUMBERS)
        }

        public getActionName(): string {
            return "countdown";
        }

        public triggerLemAction(lem: Lemming): boolean {
            return lem.setCountDown(this);
        }

        /** render Lemming to gamedisply */
        public draw(gameDisplay: DisplayImage, lem: Lemming) {
            let count = lem.getCountDownTime();

            if (count <= 0) {
                return;
            }

            let numberFrame = this.numberMasks.GetMask(count);

            gameDisplay.drawMask(numberFrame, lem.x, lem.y);
        }



        public process(level: Level, lem: Lemming): LemmingStateType {

            if (lem.countdown <= 0) {
                return LemmingStateType.NO_STATE_TYPE;
            }

            lem.countdown--;

            if (lem.countdown == 0){
                lem.setCountDown(null);
                return LemmingStateType.OHNO;
            }
            
            return LemmingStateType.NO_STATE_TYPE;
        }


    }

}
