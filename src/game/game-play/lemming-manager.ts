import { LemmingsSprite } from '../resources/lemmings-sprite';
import { TriggerTypes } from '../resources/lemmings/trigger-types';
import { Level } from '../resources/level';
import { MaskProvider } from '../resources/mask-provider';
import { ParticleTable } from '../resources/particle-table';
import { LogHandler } from '../utilities/log-handler';
import { DisplayImage } from '../view/display-image';
import { IActionSystem } from './action-system';
import { ActionBashSystem } from './actions/action-bash-system';
import { ActionBlockerSystem } from './actions/action-blocker-system';
import { ActionBuildSystem } from './actions/action-build-system';
import { ActionClimbSystem } from './actions/action-climb-system';
import { ActionCountdownSystem } from './actions/action-countdown-system';
import { ActionDiggSystem } from './actions/action-digg-system';
import { ActionDrowningSystem } from './actions/action-drowning-system';
import { ActionExitingSystem } from './actions/action-exiting-system';
import { ActionExplodingSystem } from './actions/action-exploding-system';
import { ActionFallSystem } from './actions/action-fall-system';
import { ActionFloatingSystem } from './actions/action-floating-system';
import { ActionHoistSystem } from './actions/action-hoist-system';
import { ActionJumpSystem } from './actions/action-jump-system';
import { ActionMineSystem } from './actions/action-mine-system';
import { ActionOhNoSystem } from './actions/action-ohno-system';
import { ActionShrugSystem } from './actions/action-shrug-system';
import { ActionSplatterSystem } from './actions/action-splatter-system';
import { ActionWalkSystem } from './actions/action-walk-system';
import { GameVictoryCondition } from './game-victory-condition';
import { Lemming } from './lemming';
import { LemmingStateType } from './lemming-state-type';
import { SkillTypes } from './skill-types';
import { TriggerManager } from './trigger-manager';

    export class LemmingManager {

        /** list of all Lemming in the game */
        private lemmings: Lemming[] = [];

        /** list of all Actions a Lemming can do */
        private actions: IActionSystem[] = [];
        private skillActions: IActionSystem[] = [];

        private releaseTickIndex: number = 0;

        private logging = new LogHandler("LemmingManager");

        /** next lemming index need to explode */
        private nextNukingLemmingsIndex: number = -1;

        constructor(private level: Level,
            lemmingsSprite: LemmingsSprite,
            private triggerManager: TriggerManager,
            private gameVictoryCondition: GameVictoryCondition,
            masks: MaskProvider,
            particleTable: ParticleTable) {

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
            this.actions[LemmingStateType.EXPLODING] = new ActionExplodingSystem(lemmingsSprite, masks, triggerManager, particleTable);
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
            this.skillActions[SkillTypes.BOMBER] = new ActionCountdownSystem(masks);

            /// wait before first lemming is spawn
            this.releaseTickIndex = this.gameVictoryCondition.getCurrentReleaseRate() - 30;
        }


        private processNewAction(lem: Lemming, newAction: LemmingStateType): boolean {

            if (newAction == LemmingStateType.NO_STATE_TYPE) {
                return false;
            }

            this.setLemmingState(lem, newAction);

            return true;
        }


        /** process all Lemmings to the next time-step */
        public tick() {

            this.addNewLemmings();

            let lems = this.lemmings;

            if (this.isNuking()) {
                this.doLemmingAction(lems[this.nextNukingLemmingsIndex], SkillTypes.BOMBER);
                this.nextNukingLemmingsIndex++;
            }

            for (let i = 0; i < lems.length; i++) {

                let lem = lems[i];

                if (lem.removed) continue;

                let newAction = lem.process(this.level);
                this.processNewAction(lem, newAction);

                let triggerAction = this.runTrigger(lem);
                this.processNewAction(lem, triggerAction);
            }
        }

        /** Add a new Lemming to the manager */
        private addLemming(x: number, y: number) {

            let lem = new Lemming(x, y, this.lemmings.length);

            this.setLemmingState(lem, LemmingStateType.FALLING);

            this.lemmings.push(lem);
        }


        /** let a new lemming arise from an entrance */
        private addNewLemmings() {
            if (this.gameVictoryCondition.getLeftCount() <= 0) {
                return;
            }

            this.releaseTickIndex++;

            if (this.releaseTickIndex >= (104 - this.gameVictoryCondition.getCurrentReleaseRate())) {
                this.releaseTickIndex = 0;

                let entrance = this.level.entrances[0];

                this.addLemming(entrance.x + 24, entrance.y + 14);

                this.gameVictoryCondition.releaseOne();
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
                    this.logging.log("unknown trigger type: " + triggerType);
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

        /** render all Lemmings to the GameDisplay */
        public renderDebug(gameDisplay: DisplayImage) {
            let lems = this.lemmings;

            for (let i = 0; i < lems.length; i++) {
                lems[i].renderDebug(gameDisplay);
            }
        }

        /** return the lemming with a given id */
        public getLemming(id:number): Lemming {
            return this.lemmings[id];
        }

        /** return a lemming at a given position */
        public getLemmingAt(x: number, y: number): Lemming | null {
            let lems = this.lemmings;

            let minDistance = 99999;
            let minDistanceLem = null;

            for (let i = 0; i < lems.length; i++) {
                let lem = lems[i];

                let distance = lem.getClickDistance(x, y);
                //console.log("--> "+ distance);

                if ((distance < 0) || (distance >= minDistance)) {
                    continue;
                }

                minDistance = distance;
                minDistanceLem = lem;
            }
            //console.log("====> "+ (minDistanceLem? minDistanceLem.id : "null"));
            return minDistanceLem;
        }

        /** change the action a Lemming is doing */
        private setLemmingState(lem: Lemming, stateType: LemmingStateType) {

            if (stateType == LemmingStateType.OUT_OFF_LEVEL) {
                lem.remove();
                this.gameVictoryCondition.removeOne();
                return;
            }

            let actionSystem = this.actions[stateType];

            if (actionSystem == null) {
                lem.remove();

                this.logging.log(lem.id + " Action: Error not an action: " + LemmingStateType[stateType]);
                return;
            }
            else {
                this.logging.debug(lem.id + " Action: " + actionSystem.getActionName());
            }

            lem.setAction(actionSystem);
        }


        /** change the action a Lemming is doing */
        public doLemmingAction(lem: Lemming, skillType: SkillTypes): boolean {
            if (lem == null) {
                return false;
            }

            let actionSystem = this.skillActions[skillType];
            if (!actionSystem) {
                this.logging.log(lem.id + " Unknown Action: " + skillType);
                return false;
            }

            return actionSystem.triggerLemAction(lem);
        }


        /** return if the game is in nuke state */
        public isNuking() {
            return this.nextNukingLemmingsIndex >= 0;
        }


        /** start the nuking of all lemmings */
        public doNukeAllLemmings() {
            this.nextNukingLemmingsIndex = 0;
        }
    }

