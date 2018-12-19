
module Lemmings {

    export enum ActionType {
        NO_ACTION_TYPE,
        WALKING,
        SPLATTING, // after falling down from too high
        EXPLODING, // fire ball and explosion particles
        FALLING,
        JUMPING,
        DIGGING,
        CLIMBING,
        HOISTING, // end of climbing
        BUILDING,
        BLOCKING, // 10
        BASHING,
        FLOATING,
        MINEING,
        DROWNING, // in water
        EXITING,
        FRYING, // killed by flameblower etc.
        OHNO,
        LEMACTION_SHRUG, // builder finished buildung
        OUT_OFF_LEVEL
    }
}