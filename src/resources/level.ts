
module Lemmings {

    /** Level Data */
    export class Level {

        /** the background image */
        private groundImage: Uint8ClampedArray;//ImageData;

        /** the background mask 0=noGround / 1=ground*/
        public groundMask : Int8Array;

        /** objects on the map: entrance/exit/traps */
        //public mapObjects:LevelElement[] = [];
        public objects: MapObject[] = [];

        public entrances:LevelElement[] = [];

        public triggers:Trigger[] = [];

        /** detailed information about the object image mainly animation and trap details */
        //public objectImg:ObjectImageInfo[] = [];

       // public terrain: Uint8ClampedArray;
        
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

        public colorPalette:ColorPalette;
        public groundPalette:ColorPalette;
        public previewPalette:ColorPalette;



        /** set the map objects of this level and update trigger */
        public setMapObjects(objects:LevelElement[], objectImg:ObjectImageInfo[]):void {
            //this.mapObjects = objects;
            this.entrances = [];
            //this.objectImg = objectImg;
            this.triggers = [];
            this.objects = [];

            /// process all objects
            for(let i = 0; i < objects.length; i++){
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
        public isOutOfLevel(y:number):boolean {
            return ((y >= this.height) || (y <= 0));
        }

        /** check if a point is solid */
        public hasGroundAt(x:number, y:number):boolean {
            if ((x < 0) || (x >= this.width)) return false;
            if ((y < 0) || (y >= this.height)) return false;

            return (this.groundMask[x + y * this.width] != 0);
        }
        
        /** clear a point  */
        public clearGroundAt(x:number, y:number) {
            let index = x + y * this.width;

            this.groundMask[index] = 0;

            index = index * 4;
            this.groundImage[index + 0] = 0;
            this.groundImage[index + 1] = 0;
            this.groundImage[index + 2] = 0;
        }


        public setGroundImage(img: Uint8ClampedArray) {
            this.groundImage = new Uint8ClampedArray(img);
        }

        /** set the color palettes for this level */
        public setPalettes(colorPalette:ColorPalette, groundPalette:ColorPalette) {
            this.colorPalette = colorPalette;
            this.groundPalette = groundPalette;
        }
        

        constructor() {
           
        }

        /** render ground to display */
        public render(gameDisplay:DisplayImage) {
            gameDisplay.initSize(this.width, this.height);

            gameDisplay.setBackground(this.groundImage);
        }

    }

}
