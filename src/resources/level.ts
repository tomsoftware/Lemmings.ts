
module Lemmings {

    /** Level Data */
    export class Level {

        public terrain: Uint8ClampedArray;
        
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

        /** the background image */
        public groundImage: Uint8ClampedArray;//ImageData;

        constructor() {
           
        }

    }

}
