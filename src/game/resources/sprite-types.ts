
export enum SpriteTypes {
    WALKING,

    EXPLODING, // fire ball and explosion particles

    JUMPING,
    DIGGING,

    CLIMBING,
    POSTCLIMBING, // end of climbing

    BUILDING,
    BLOCKING,
    BASHING,

    FALLING,
    UMBRELLA,  // 8 frames opening + 8 frames floating
    SPLATTING, // after falling down from too high

    MINEING,
    DROWNING, // in water
    EXITING,
    FRYING, // killed by flameblower etc.
    OHNO,
    LEMACTION_SHRUG, // builder finished buildung

    SHRUGGING,

    OUT_OFF_LEVEL
}
