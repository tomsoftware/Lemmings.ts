module Lemmings {

    export class LemmingManager {

        /** list of all Lemming in the game */
        private lemmings : Lemming [] = [];

        /** list of all Actions a Lemming can do */
        private actions : IActionSystem[] = [];


        constructor(lemingsSprite:LemmingsSprite) {
            this.actions[ActionType.WALKING] = new ActionWalkSystem(lemingsSprite);
            this.actions[ActionType.FALLING] = new ActionFallSystem(lemingsSprite);
            this.actions[ActionType.JUMPING] = new ActionJumpSystem(lemingsSprite);
            this.actions[ActionType.DIGGING] = new ActionDiggSystem(lemingsSprite);
        }

        /** Add a new Lemming to the manager */
        public addLemming(x:number, y:number) {

            let lem = new Lemming();

            lem.x = x;
            lem.y = y;
            lem.lookRight = true;
            lem.id = "Lem"+ this.lemmings.length;

            this.setLemAction(lem, ActionType.FALLING);

            this.lemmings.push(lem);
        }


        /** process all Lemmings one time-step */
        public tick(level:Level){

            let lems = this.lemmings;

            for(let i = 0; i < lems.length; i++) {

                let lem = lems[i];

                let newAction = lem.action.process(level, lem);
                if (newAction != ActionType.NO_ACTION_TYPE) {
                   this.setLemAction(lem, newAction); 
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

                console.log("lem "+ lem.id +" ( "+ lem.x +" / "+ lem.y +")");

                if (((lem.x - 2) <= x) && ((lem.x + 2) >= x) && ((lem.y - 4) <= y) && (lem.y > y)) {
                    return lem;
                }
            }

            return null;
        }

        /** change the action a Lemming is doing */
        private setLemAction(lem:Lemming, actionType : ActionType ) {
            lem.setAction(this.actions[actionType]);
            if (lem.action == null) {
                console.log(lem.id +" Action: no action: "+ ActionType[actionType] );
                return;
            }

            console.log(lem.id +" Action: "+ lem.action.getActionName());
        }
    }

}
