import { SkillTypes } from '@/game/game-play/skill-types';

    export class LevelProperties
    {
        public levelName: string = "";

        public releaseRate = 0;
        public releaseCount = 0;
        public needCount = 0;
        public timeLimit = 0;
        public skills: SkillTypes[] = new Array(SkillTypes.length());
    }    
