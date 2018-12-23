/// <reference path="../file/binary-reader.ts"/>
/// <reference path="../error-handler.ts"/>
/// <reference path="./color-palette.ts"/>



module Lemmings {

    /** base image information of objects */
    export class BaseImageInfo {

        public width: number = 0;
        public height: number = 0;

        /// normale case
        ///           +------------+
        /// imageLoc: |            | 1st Bits
        ///           |            | 2th Bits
        /// vgaLoc:   |            | 3th Bits
        /// maskLoc:  |            | 4th Bits
        ///           +------------+
        
        /** position of the image in the file */
        public imageLoc: number = 0;

        /** position of the (alpha) mask in the file */
        public maskLoc: number = 0;

        /** position of the vga bits in the file */
        public vgaLoc: number = 0;

        /** size of one frame in the file */
        public frameDataSize: number = 0;

        /** the images */
        public frames: Uint8Array[];

        /** number of frames used by this image */
        public frameCount: number = 0;

        /** the color palette to be used for this image */
        public palette:ColorPalette = null;

    }
}
