module Lemmings {

    export class LemmingManager {

        private lemmings : Lemming [] = [];
        private actions : ActionSystem[] = [];


        constructor(lemingsSprite:LemmingsSprite) {
            this.actions[ActionType.WALKING] = new ActionWalkSystem(lemingsSprite);
            this.actions[ActionType.FALLING] = new ActionFallSystem(lemingsSprite);
        }


        public addLemming(x:number, y:number) {

            let l = new Lemming();

            l.x = x;
            l.y = y;
            l.lookRight = true;
            l.action = ActionType.FALLING;

            this.lemmings.push(l);
        }


        public tick(level:Level){

            let lems = this.lemmings;

            for(let i = 0 ;i < lems.length; i++){
                let lem = lems[i];

                this.actions[lem.action].process(level, lem);

                console.log(lem.x + " "+ lem.y);
            }
        }
    }

}
