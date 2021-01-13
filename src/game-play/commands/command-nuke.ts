module Lemmings {

    /** Commands a all lemmings nuke */
    export class CommandNuke implements ICommand {

        private log = new LogHandler("CommandNuke");

        public getCommandKey():string {
            return "n";
        }

        /** load parameters for this command from serializer */
        load(values: number[]):void{
            
        }

        /** save parameters of this command to serializer */
        save():number[]{
            return [];
        }

        /** execute this command */
        execute(game:Game):boolean{
            let lemManager = game.getLemmingManager();

            if (lemManager.isNuking()) return false;

            lemManager.doNukeAllLemmings();
            game.getVictoryCondition().doNuke();
            
            return true;
        }  
    }
}
