
module Lemmings {

    /** Level Data */
    export class Level {

        /** the background image */
        public groundImage: Uint8ClampedArray;//ImageData;

        public groundMask : Int8Array;

        /** objects on the map: entrance/exit/traps */
        public mapObjects:LevelElement[] = [];

        public entrances:LevelElement[] = [];

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


        /** set the map objects of this level */
        public setMapObjects(objects:LevelElement[]) {
            this.mapObjects = objects;
            this.entrances = [];

            for(let i=0; i<objects.length; i++){
                let ob = objects[i];

                if (ob.id == 0) this.entrances.push(ob);
            }
        }

        
        public isOutOfLevel(y:number) {
            return false;
        }

        /** check if a point is solid */
        public has_pixel_at(x:number, y:number){
            return (this.groundMask[x + y*this.width] == 0);
        }

        constructor() {
           
        }

    }

}
