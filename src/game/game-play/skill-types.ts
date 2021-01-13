
    /** the skills/behaviors a Lemming could have */
    export enum SkillTypes {
        UNKNOWN,
        CLIMBER,
        FLOATER,
        BOMBER,
        BLOCKER,
        BUILDER,
        BASHER,
        MINER,
        DIGGER
    };

    /** helper functions for SkillTypes */
    export module SkillTypes {

        export function toString(type: SkillTypes): string {
            return SkillTypes[type];
        }

        export function length() {
            return 9;
        }

        export function isValid(type: SkillTypes): boolean {
            if (type == null) return false;
            return ((type > SkillTypes.UNKNOWN) && (type < SkillTypes.length()))
        }
    }
