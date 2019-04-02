/// <reference path="./lemming-state-type.ts"/>

module Lemmings {

    export class LemmingManager {

        /** list of all Lemming in the game */
        private lemmings: Lemming[] = [];

        /** list of all Actions a Lemming can do */
        private actions: IActionSystem[] = [];
        private skillActions: IActionSystem[] = [];

        private releaseTickIndex: number = 0;

        constructor(private level: Level,
            lemmingsSprite: LemmingsSprite,
            private triggerManager: TriggerManager,
            private gameVictoryCondition: GameVictoryCondition,
            masks: MaskProvider) {

            this.actions[LemmingStateType.WALKING] = new ActionWalkSystem(lemmingsSprite);
            this.actions[LemmingStateType.FALLING] = new ActionFallSystem(lemmingsSprite);
            this.actions[LemmingStateType.JUMPING] = new ActionJumpSystem(lemmingsSprite);
            this.actions[LemmingStateType.DIGGING] = new ActionDiggSystem(lemmingsSprite);
            this.actions[LemmingStateType.EXITING] = new ActionExitingSystem(lemmingsSprite, gameVictoryCondition);
            this.actions[LemmingStateType.FLOATING] = new ActionFloatingSystem(lemmingsSprite);
            this.actions[LemmingStateType.BLOCKING] = new ActionBlockerSystem(lemmingsSprite, triggerManager);
            this.actions[LemmingStateType.MINEING] = new ActionMineSystem(lemmingsSprite, masks);
            this.actions[LemmingStateType.CLIMBING] = new ActionClimbSystem(lemmingsSprite);
            this.actions[LemmingStateType.HOISTING] = new ActionHoistSystem(lemmingsSprite);
            this.actions[LemmingStateType.BASHING] = new ActionBashSystem(lemmingsSprite, masks);
            this.actions[LemmingStateType.BUILDING] = new ActionBuildSystem(lemmingsSprite);
            this.actions[LemmingStateType.SHRUG] = new ActionShrugSystem(lemmingsSprite);
            this.actions[LemmingStateType.EXPLODING] = new ActionExplodingSystem(lemmingsSprite, masks, triggerManager);
            this.actions[LemmingStateType.OHNO] = new ActionOhNoSystem(lemmingsSprite);
            this.actions[LemmingStateType.SPLATTING] = new ActionSplatterSystem(lemmingsSprite);
            this.actions[LemmingStateType.DROWNING] = new ActionDrowningSystem(lemmingsSprite);
            

            this.skillActions[SkillTypes.DIGGER] = this.actions[LemmingStateType.DIGGING];
            this.skillActions[SkillTypes.FLOATER] = this.actions[LemmingStateType.FLOATING];
            this.skillActions[SkillTypes.BLOCKER] = this.actions[LemmingStateType.BLOCKING];
            this.skillActions[SkillTypes.MINER] = this.actions[LemmingStateType.MINEING];
            this.skillActions[SkillTypes.CLIMBER] = this.actions[LemmingStateType.CLIMBING];
            this.skillActions[SkillTypes.BASHER] = this.actions[LemmingStateType.BASHING];
            this.skillActions[SkillTypes.BUILDER] = this.actions[LemmingStateType.BUILDING];
            this.skillActions[SkillTypes.BOMBER] =  new ActionCountdownSystem(masks);

            this.releaseTickIndex = 99;
        }



        private ProcessNewAction(lem:Lemming, newAction: LemmingStateType):boolean {

            if (newAction == LemmingStateType.NO_STATE_TYPE) return false;

            this.setLemmingState(lem, newAction);
            
            return true;
        }

        /** process all Lemmings one time-step */
        public tick() {

            this.addNewLemmings();

            let lems = this.lemmings;

            for (let i = 0; i < lems.length; i++) {

                let lem = lems[i];

                if (lem.removed) continue;

                let newAction = lem.process(this.level);
                this.ProcessNewAction(lem, newAction);

                let triggerAction = this.runTrigger(lem);
                this.ProcessNewAction(lem, triggerAction);

                /*
                let actionName = "[Unknown]";
                if (lem.action != null) {
                    actionName = lem.action.getActionName()
                }

                console.log(lem.id + " :: x:" + lem.x + " y:" + lem.y + " Action: " + actionName);
                */
            }
        }

        /** Add a new Lemming to the manager */
        private addLemming(x: number, y: number) {

            let lem = new Lemming(x, y, this.lemmings.length);

            this.setLemmingState(lem, LemmingStateType.FALLING);

            this.lemmings.push(lem);
        }


        /** let a new lemming be born from a entrance  */
        private addNewLemmings() {
            if (this.gameVictoryCondition.GetLeftCount() <= 0) return;

            this.releaseTickIndex++;

            if (this.releaseTickIndex >= (104 - this.gameVictoryCondition.GetCurrentReleaseRate())) {
                this.releaseTickIndex = 0;

                let entrance = this.level.entrances[0];

                this.addLemming(entrance.x + 24, entrance.y + 14);

                this.gameVictoryCondition.ReleaseOne();
            }
        }



        private runTrigger(lem: Lemming): LemmingStateType {
            if (lem.isRemoved() || (lem.isDisabled())) {
                return LemmingStateType.NO_STATE_TYPE;
            }

            let triggerType = this.triggerManager.trigger(lem.x, lem.y);

            switch (triggerType) {
                case TriggerTypes.NO_TRIGGER:
                    return LemmingStateType.NO_STATE_TYPE;
                case TriggerTypes.DROWN:
                    return LemmingStateType.DROWNING;
                case TriggerTypes.EXIT_LEVEL:
                    return LemmingStateType.EXITING;
                case TriggerTypes.KILL:
                    return LemmingStateType.SPLATTING;
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

            for (let i = 0; i < lems.length; i++) {
                lems[i].render(gameDisplay);
            }
        }

        /** return a lemming a a geiven position */
        public getLemmingAt(x: number, y: number): Lemming {
            let lems = this.lemmings;

            let minDistance = 99999;
            let minDistanceLem = null;

            for (let i = 0; i < lems.length; i++) {
                let lem = lems[i];

                let distance = lem.getClickDistance(x, y);
                if ((distance < 0) || (distance >= minDistance)) {
                    continue;
                }
                
                minDistance = distance;
                minDistanceLem = lem;
            }

            return minDistanceLem;
        }

        /** change the action a Lemming is doing */
        private setLemmingState(lem: Lemming, stateType: LemmingStateType) {

            if (stateType == LemmingStateType.OUT_OFF_LEVEL) {
                lem.remove();
                this.gameVictoryCondition.RemoveOne();
                return;
            }

            let actionSystem = this.actions[stateType];

            if (actionSystem == null) {
                lem.remove();

                console.log(lem.id + " Action: Error not an action: " + LemmingStateType[stateType]);
                return;
            }
            else {
                console.log(lem.id + " Action: " + actionSystem.getActionName());
            }

            lem.setAction(actionSystem);

        }

        /** change the action a Lemming is doing */
        public doLemmingAction(lem: Lemming, actionType: SkillTypes): boolean {
            let actionSystem = this.skillActions[actionType];
            if (!actionSystem) {
                console.log(lem.id + " Unknown Action: " + actionType);
                return false;
            }

            return actionSystem.triggerLemAction(lem);
        }
    }

}
