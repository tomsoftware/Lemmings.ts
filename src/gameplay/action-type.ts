
module Lemmings {

    export enum ActionType {
        WALKING = 0,
        SPLATTING = 1, // after falling down from too high
        EXPLODING = 2, // fire ball and explosion particles
        FALLING = 3,
        JUMPING = 4,
        DIGGING = 5,
        CLIMBING = 6,
        HOISTING = 7, // end of climbing
        BUILDING = 8,
        BLOCKING = 9,
        BASHING = 10,
        FLOATING = 11,
        MINEING = 12,
        DROWNING = 13, // in water
        EXITING = 14,
        FRYING = 15, // killed by flameblower etc.
        OHNO = 16,
        LEMACTION_SHRUG = 17, // builder finished buildung
        OUT_OFF_LEVEL = 20
    }
}