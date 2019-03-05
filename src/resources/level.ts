
module Lemmings {

    /** Level Data */
    export class Level {

        /** the background image */
        private groundImage: Uint8ClampedArray;//ImageData;

        /** the background mask 0=noGround / 1=ground*/
        public groundMask: SolidLayer = null;

        /** objects on the map: entrance/exit/traps */
        public objects: MapObject[] = [];

        public entrances: LevelElement[] = [];

        public triggers: Trigger[] = [];


        public gameType: GameTypes;
        public levelMode: number;
        public levelIndex: number;

        public name: string = "";
        public width = 1600;
        public height = 160;
        public releaseRate = 0;
        public releaseCount = 0;
        public needCount = 0;
        public timeLimit = 0;
        public skills: SkillTypes[] = new Array(SkillTypes.length());
        public screenPositionX = 0;

        public isSuperLemming = false;

        public colorPalette: ColorPalette;
        public groundPalette: ColorPalette;
        public previewPalette: ColorPalette;



        /** set the map objects of this level and update trigger */
        public setMapObjects(objects: LevelElement[], objectImg: ObjectImageInfo[]): void {
            this.entrances = [];
            this.triggers = [];
            this.objects = [];

            /// process all objects
            for (let i = 0; i < objects.length; i++) {
                let ob = objects[i];
                let objectInfo = objectImg[ob.id];

                /// add object
                let newMapObject = new MapObject(ob, objectInfo);
                this.objects.push(newMapObject);

                /// add entrances
                if (ob.id == 1) this.entrances.push(ob);

                /// add triggers
                if (objectInfo.trigger_effect_id != 0) {
                    let x1 = ob.x + objectInfo.trigger_left;
                    let y1 = ob.y + objectInfo.trigger_top;

                    let x2 = x1 + objectInfo.trigger_width;
                    let y2 = y1 + objectInfo.trigger_height;

                    let newTrigger = new Trigger(objectInfo.trigger_effect_id, x1, y1, x2, y2, 0, objectInfo.trap_sound_effect_id);

                    this.triggers.push(newTrigger);
                }

            }
        }

        /** check if a y-position is out of the level */
        public isOutOfLevel(y: number): boolean {
            return ((y >= this.height) || (y <= 0));
        }

        /** return the layer that defines if a pixel in the level is solid */
        public getGroundMaskLayer(): SolidLayer {
            if (this.groundMask == null) {
                this.groundMask = new SolidLayer(this.width, this.height);
            }

            return this.groundMask;
        }


        /** set the GroundMaskLayer */
        public setGroundMaskLayer(solidLayer: SolidLayer): void {
            this.groundMask = solidLayer;
        }

        /** clear with mask  */
        public clearGroundWithMask(mask: Mask, x: number, y: number) {
            x += mask.offsetX;
            y += mask.offsetY;

            for (let d_y = 0; d_y < mask.height; d_y++) {
                for (let d_x = 0; d_x < mask.width; d_x++) {
                    if (!mask.at(d_x, d_y)) {
                        this.clearGroundAt(x + d_x, y + d_y);
                    }
                }
            }

        }

        /** set a point in the map to solid ground  */
        public setGroundAt(x: number, y: number, palletIndex: number) {

            this.groundMask.setGroundAt(x, y);

            let index = (y * this.width + x) * 4;
            this.groundImage[index + 0] = this.colorPalette.getR(palletIndex);
            this.groundImage[index + 1] = this.colorPalette.getG(palletIndex);
            this.groundImage[index + 2] = this.colorPalette.getB(palletIndex);
        }

        /** checks if a point is solid ground  */
        public hasGroundAt(x: number, y: number): boolean {
            return this.groundMask.hasGroundAt(x, y);
        }


        /** clear a point  */
        public clearGroundAt(x: number, y: number) {

            this.groundMask.clearGroundAt(x, y);

            let index = (y * this.width + x) * 4;

            this.groundImage[index + 0] = 0; // R
            this.groundImage[index + 1] = 0; // G
            this.groundImage[index + 2] = 0; // B
        }


        public setGroundImage(img: Uint8ClampedArray) {
            this.groundImage = new Uint8ClampedArray(img);
        }

        /** set the color palettes for this level */
        public setPalettes(colorPalette: ColorPalette, groundPalette: ColorPalette) {
            this.colorPalette = colorPalette;
            this.groundPalette = groundPalette;
        }


        constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
        }

        /** render ground to display */
        public render(gameDisplay: DisplayImage) {
            gameDisplay.initSize(this.width, this.height);

            gameDisplay.setBackground(this.groundImage, this.groundMask);
        }

    }

}
