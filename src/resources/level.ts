
module Lemmings {

    /** Level Data */
    export class Level {

        /** the background image */
        private groundImage: Uint8ClampedArray;//ImageData;

        /** the background mask 0=noGround / 1=ground*/
        public groundMask : Int8Array;

        /** objects on the map: entrance/exit/traps */
        public mapObjects:LevelElement[] = [];

        public entrances:LevelElement[] = [];

        public objectImg:ObjectImageInfo[] = [];

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



        /** set the map objects of this level */
        public setMapObjects(objects:LevelElement[], objectImg:ObjectImageInfo[]):void {
            this.mapObjects = objects;
            this.entrances = [];

            for(let i = 0; i<objects.length; i++){
                let ob = objects[i];

                if (ob.id == 0) this.entrances.push(ob);
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
        public setPalettes(colorPalette:ColorPalette, groundPalette:ColorPalette, previewPalette:ColorPalette) {
            this.colorPalette = colorPalette;
            this.groundPalette = groundPalette;
            this.previewPalette = previewPalette;
        }
        

        constructor() {
           
        }

        /** render ground to display */
        public render(gameDisplay:GameDisplay) {
            gameDisplay.initSize(this.width, this.height);

            gameDisplay.setBackground(this.groundImage);
        }

    }

}
