module Lemmings {

    /** Increase the release rate */
    export class CommandReleaseRateDecrease implements ICommand {

        private log = new LogHandler("CommandReleaseRateDecrease");
        private number:number;

        public constructor(number?: number) {
            if (number != null) this.number = number;
        }

        public  getCommandKey():string {
            return "d";
        }

        /** load parameters for this command from serializer */
        load(values: number[]):void{
            if (values.length < 1) {
                this.log.log("Unable to process load");
                return;
            }
            this.number = values[0];
        }

        /** save parameters of this command to serializer */
        save():number[]{
            return [this.number];
        }

        /** execute this command */
        execute(game:Game):boolean{
            let victoryConditions = game.getVictoryCondition();
            victoryConditions.changeReleaseRate(-this.number);

            return true;
        }  
    }
}
