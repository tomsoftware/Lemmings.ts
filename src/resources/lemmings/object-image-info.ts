/// <reference path="./base-image-info.ts"/>
/// <reference path="./trigger-types.ts"/>

module Lemmings {

    /** stores sprite image properties of objects */
    export class ObjectImageInfo extends BaseImageInfo {
        public animationLoop: boolean = false;
        public firstFrameIndex: number = 0;
        public unknown1: number = 0;
        public unknown2: number = 0;
        public trigger_left: number = 0;
        public trigger_top: number = 0;
        public trigger_width: number = 0;
        public trigger_height: number = 0;
        public trigger_effect_id: TriggerTypes = 0;
        public preview_image_index: number = 0;
        public unknown: number = 0;
        public trap_sound_effect_id: number = 0;
    }

}