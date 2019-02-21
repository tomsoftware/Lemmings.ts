/// <reference path="./lemming-state-type.ts"/>

module Lemmings {

    export class LemmingManager {

        /** list of all Lemming in the game */
        private lemmings: Lemming[] = [];

        /** list of all Actions a Lemming can do */
        private actions: IActionSystem[] = [];


        private releaseTickIndex : number = 0;

        constructor(private level: Level,
                    lemingsSprite: LemmingsSprite,
                    private triggerManager: TriggerManager,
                    private gameVictoryCondition:GameVictoryCondition,
                    private masks:MaskProvider) {

            this.actions[LemmingStateType.WALKING] = new ActionWalkSystem(lemingsSprite);
            this.actions[LemmingStateType.FALLING] = new ActionFallSystem(lemingsSprite);
            this.actions[LemmingStateType.JUMPING] = new ActionJumpSystem(lemingsSprite);
            this.actions[LemmingStateType.DIGGING] = new ActionDiggSystem(lemingsSprite);
            this.actions[LemmingStateType.EXITING] = new ActionExitingSystem(lemingsSprite, gameVictoryCondition);
            this.actions[LemmingStateType.FLOATING] = new ActionFloatingSystem(lemingsSprite);
            this.actions[LemmingStateType.BLOCKING] = new ActionBlockerSystem(lemingsSprite, triggerManager);
            this.actions[LemmingStateType.MINEING] = new ActionMineSystem(lemingsSprite, masks);
            this.actions[LemmingStateType.CLIMBING] = new ActionClimbSystem(lemingsSprite);
            this.actions[LemmingStateType.HOISTING] = new ActionHoistSystem(lemingsSprite);
            this.actions[LemmingStateType.BASHING] = new ActionBashSystem(lemingsSprite, masks);
            
            this.releaseTickIndex = 99;
        }

        /** Add a new Lemming to the manager */
        public addLemming(x: number, y: number) {

            let lem = new Lemming();

            lem.x = x;
            lem.y = y;
            lem.id = "Lem" + this.lemmings.length;
            
            this.setLemmingState(lem, LemmingStateType.FALLING);

            this.lemmings.push(lem);
        }


        /** process all Lemmings one time-step */
        public tick() {

            this.addNewLemmings();

            let lems = this.lemmings;

            for (let i = 0; i < lems.length; i++) {

                let lem = lems[i];

                if (lem.action == null) continue;

                let newAction = lem.action.process(this.level, lem);
                if (newAction != LemmingStateType.NO_STATE_TYPE) {
                    this.setLemmingState(lem, newAction);
                }

                let triggerAction = this.runTrigger(lem);
                if (triggerAction != LemmingStateType.NO_STATE_TYPE) {
                    this.setLemmingState(lem, triggerAction);
                }

                let actionName = "[Unknown]";
                if (lem.action != null) {
                    actionName = lem.action.getActionName()
                }

               // console.log(lem.id + " :: x:" + lem.x + " y:" + lem.y + " Action: " + actionName);
            }
        }

        /** let a new lemming be born from a entrance  */
        private addNewLemmings() {
            if (this.gameVictoryCondition.GetLeftCount() <= 0) return;

            this.releaseTickIndex++;

            if (this.releaseTickIndex >=  (100 - this.gameVictoryCondition.GetCurrentReleaseRate())) {
                this.releaseTickIndex = 0;

                let entrance = this.level.entrances[0];
            
                this.addLemming(entrance.x + 24, entrance.y + 14);

                this.gameVictoryCondition.ReleaseOne();
            }
        }



        private runTrigger(lem: Lemming): LemmingStateType {
            if (lem.removed) return LemmingStateType.NO_STATE_TYPE;

            let triggerType = this.triggerManager.trigger(lem.x, lem.y);
            
            switch (triggerType) {
                case TriggerTypes.NO_TRIGGER:
                    return LemmingStateType.NO_STATE_TYPE;
                case TriggerTypes.DROWN:
                    return LemmingStateType.DROWNING;
                case TriggerTypes.EXIT_LEVEL:
                    return LemmingStateType.EXITING;
                case TriggerTypes.KILL:
                    return LemmingStateType.EXPLODING;
                case TriggerTypes.TRAP:
                    return LemmingStateType.HOISTING;
                case TriggerTypes.BLOCKER_LEFT:
                    if (lem.lookRight) lem.lookRight = false;
                    return LemmingStateType.NO_STATE_TYPE;
                case TriggerTypes.BLOCKER_RIGHT:
                    if (!lem.lookRight) lem.lookRight = true;
                    return LemmingStateType.NO_STATE_TYPE;
                default:
                    console.error("unknown trigger type: " + triggerType);
                    return LemmingStateType.NO_STATE_TYPE;

            }
        }


        /** render all Lemmings to the GameDisplay */
        public render(gameDisplay: DisplayImage) {
            let lems = this.lemmings;

            //gameDisplay.drawRectangle(this.clickRect, 255,255,0);

            for (let i = 0; i < lems.length; i++) {
                let lem = lems[i];

                if (lem.action != null){
                    lem.action.draw(gameDisplay, lem);
                    gameDisplay.setDebugPixel(lem.x, lem.y)
                } 
            }
        }

        //private clickRect:Rectangle = new Rectangle(0,0,0,0);

        public getLemmingAt(x: number, y: number): Lemming {
            let lems = this.lemmings;

            for (let i = 0; i < lems.length; i++) {
                let lem = lems[i];

                let x1 = lem.x - 3;
                let y1 = lem.y - 9;
                let x2 = lem.x + 3;
                let y2 = lem.y - 1;

                //this.clickRect = new Rectangle(x1, y1, x2, y2);

                if ((x >= x1) && (x <= x2) && (y >= y1) && (y < y2)) {
                    return lem;
                }
            }

            return null;
        }

        /** change the action a Lemming is doing */
        private setLemmingState(lem: Lemming, stateType: LemmingStateType) {
  
            if (stateType == LemmingStateType.OUT_OFF_LEVEL) {
                lem.action = null;
                lem.removed = true;
                this.gameVictoryCondition.RemoveOne();
                return;
            }

            let actionSystem = this.actions[stateType];

            lem.setAction(actionSystem);
            if (lem.action == null) {
                console.log(lem.id + " Action: Error not an action: " + LemmingStateType[stateType]);
                return;
            }
            else {
                console.log(lem.id + " Action: " + lem.action.getActionName());
            }

            
        }

        /** change the action a Lemming is doing */
        public doLemmingAction(lem: Lemming, actionType: SkillTypes):boolean {

            switch (actionType) {
                case SkillTypes.MINER:
                    this.setLemmingState(lem, LemmingStateType.MINEING);
                    return true;
                    
                case SkillTypes.BASHER:
                    this.setLemmingState(lem, LemmingStateType.BASHING);
                    return true;

                case SkillTypes.DIGGER:
                    this.setLemmingState(lem, LemmingStateType.DIGGING);
                    return true;

                case SkillTypes.BLOCKER:
                    this.setLemmingState(lem, LemmingStateType.BLOCKING);
                    return true;

                case SkillTypes.FLOATER:
                    if (lem.hasParachute) return false;
                    lem.hasParachute = true;
                    return true;

                case SkillTypes.CLIMBER:
                    if (lem.canClimb) return false;
                    lem.canClimb = true;
                    return true;

                default:
                    console.log(lem.id + " Unknown Action: " + actionType);   
            }
        }
    }

}
