
module Lemmings {

    export class GameConfig {
        /** Name of the Lemmings Game */
        public name: string = "";
        /** Path/Url to the resources */
        public path: string = "";
        /** unique GameType Name */
        public gametype: GameTypes = GameTypes.UNKNOWN;

        public audioConfig:AudioConfig = new AudioConfig();

        public level:LevelConfig = new LevelConfig();


    }

}