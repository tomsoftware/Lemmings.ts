module Lemmings {

    export class Lemming {
        public static readonly LEM_MIN_Y = -5;
        public static readonly LEM_MAX_FALLING = 60 // MAX_FALLDISTANCECOUNT

        public x=0;
        public y=0;
        public lookRight = false;
        public frame = 0;
        public canClimb = false;
        public hasParachute = false;
        public removed = false;
        public action:ActionType;
        public fall_distance=0;

        public setAction(action: ActionType){
            this.action = action;
	        this.frame = 0;
        }


       // public action: (lem: Lemming) => ActionType = null;
      //  public current_action : ActionType = ActionType.LEMACTION_WALK;



    }
}