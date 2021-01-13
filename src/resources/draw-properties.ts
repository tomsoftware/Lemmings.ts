
    /** defines the way a image is drawn to the stage */
    export class DrawProperties {
        public isErase: boolean;
        public isUpsideDown: boolean;
        public noOverwrite: boolean;
        public onlyOverwrite: boolean;

        constructor(isUpsideDown: boolean, noOverwrite: boolean, onlyOverwrite: boolean, isErase: boolean) {
            this.isUpsideDown = isUpsideDown;
            this.noOverwrite = noOverwrite;
            this.onlyOverwrite = onlyOverwrite;
            this.isErase = isErase;

            //- the original game does not allow the combination: (noOverwrite | isErase)
            if (noOverwrite) this.isErase = false;
        }
    }
