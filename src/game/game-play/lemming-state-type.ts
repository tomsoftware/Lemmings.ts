
    export enum LemmingStateType {
        NO_STATE_TYPE,
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
        SHRUG, // builder finished buildung
        OUT_OFF_LEVEL
    }
