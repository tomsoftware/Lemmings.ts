/// <reference path="../file/binary-reader.ts" />
/// <reference path="../file/file-container.ts" />
/// <reference path="../../skill-types.ts"/>

module Lemmings {

    /** The Odd Table has a list of LevelProperties to describe alternative starting conditions for a level  */
    export class OddTableReader {
        private levelProperties: LevelProperties[] = []
        private error = new ErrorHandler("OddTableReader");

        /** return the Level for a given levelNumber - LevelNumber is counting all levels from first to last of the game 
         *  Odd-Tables are only used for the "Original Lemmings" Game 
         */
        public getLevelProperties(levelNumber):LevelProperties{
            if ((levelNumber >= this.levelProperties.length) && (levelNumber < 0)) return null;

            return this.levelProperties[levelNumber];
        }

        constructor(oddfile: BinaryReader) {
            this.read(oddfile);
        }


        /** read the odd fine */
        private read(fr: BinaryReader) {
            fr.setOffset(0);

            let count = Math.floor(fr.length / 56);

            for(let i=0; i<count; i++) {
                let prop = new LevelProperties();

                prop.releaseRate = fr.readWord();
                prop.releaseCount = fr.readWord();
                prop.needCount = fr.readWord();
                prop.timeLimit = fr.readWord();

                //- read amount of skills
                prop.skills[SkillTypes.CLIMBER] = fr.readWord();
                prop.skills[SkillTypes.FLOATER] = fr.readWord();
                prop.skills[SkillTypes.BOMBER] = fr.readWord();
                prop.skills[SkillTypes.BLOCKER] = fr.readWord();
                prop.skills[SkillTypes.BUILDER] = fr.readWord();
                prop.skills[SkillTypes.BASHER] = fr.readWord();
                prop.skills[SkillTypes.MINER] = fr.readWord();
                prop.skills[SkillTypes.DIGGER] = fr.readWord();

                prop.levelName = fr.readString(32);
                this.error.debug("Level ("+ i +") Name: " + prop.levelName + " "+ prop.needCount +" "+ prop.timeLimit);

                this.levelProperties.push(prop);
            }

            this.error.debug("levelProperties: "+ this.levelProperties.length);
        }

    }
}