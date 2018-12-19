/// <reference path="./lemming-state-type.ts"/>

module Lemmings {

    export class LemmingManager {

        /** list of all Lemming in the game */
        private lemmings : Lemming [] = [];

        /** list of all Actions a Lemming can do */
        private actions : IActionSystem[] = [];


        constructor(lemingsSprite:LemmingsSprite) {
            this.actions[LemmingStateType.WALKING] = new ActionWalkSystem(lemingsSprite);
            this.actions[LemmingStateType.FALLING] = new ActionFallSystem(lemingsSprite);
            this.actions[LemmingStateType.JUMPING] = new ActionJumpSystem(lemingsSprite);
            this.actions[LemmingStateType.DIGGING] = new ActionDiggSystem(lemingsSprite);
        }

        /** Add a new Lemming to the manager */
        public addLemming(x:number, y:number) {

            let lem = new Lemming();

            lem.x = x;
            lem.y = y;
            lem.lookRight = true;
            lem.id = "Lem"+ this.lemmings.length;

            this.setLemmingState(lem, LemmingStateType.FALLING);

            this.lemmings.push(lem);
        }


        /** process all Lemmings one time-step */
        public tick(level:Level){

            let lems = this.lemmings;

            for(let i = 0; i < lems.length; i++) {

                let lem = lems[i];

                let newAction = lem.action.process(level, lem);
                if (newAction != LemmingStateType.NO_STATE_TYPE) {
                   this.setLemmingState(lem, newAction); 
                }

                console.log(lem.id +" :: x:"+ lem.x + " y:"+ lem.y  +" Action: "+ lem.action.getActionName());
            }
        }


        /** render all Lemmings to the GameDisplay */
        public render(gameDisplay:GameDisplay) {
            let lems = this.lemmings;

            for(let i = 0; i < lems.length; i++){
                let lem = lems[i];
                lem.action.draw(gameDisplay, lem);
            }
        }

        public getLemmingAt(x: number, y:number): Lemming {
            let lems = this.lemmings;

            for(let i = 0; i < lems.length; i++){
                let lem = lems[i];

                if ((x >= (lem.x - 2)) && (x <= (lem.x + 3)) && (y >= (lem.y - 8)) && (y < lem.y)) {
                    return lem;
                }
            }

            return null;
        }

        /** change the action a Lemming is doing */
        private setLemmingState(lem:Lemming, stateType: LemmingStateType ) {
            lem.setAction(this.actions[stateType]);
            if (lem.action == null) {
                console.log(lem.id +" Action: no action: "+ LemmingStateType[stateType] );
                return;
            }

            console.log(lem.id +" Action: "+ lem.action.getActionName());
        }

        /** change the action a Lemming is doing */
        public setLemmingAction(lem:Lemming, actionType: ActionType) {
            
            switch(actionType){
                case ActionType.DIGG:
                    this.setLemmingState(lem, LemmingStateType.DIGGING);
                    break;
            }
        }
    }

}
