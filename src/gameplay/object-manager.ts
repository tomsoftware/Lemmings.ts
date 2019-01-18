module Lemmings {

 
    /** manages all objects on the map */
    export class ObjectManager {
        private objects: MapObject[] = [];


        constructor(private gameTimer: GameTimer) {

        }


        /** render all Objects to the GameDisplay */
        public render(gameDisplay: DisplayImage) {
            let objs = this.objects;

            let tick = this.gameTimer.getGameTicks();

            for (let i = 0; i < objs.length; i++) {
                let obj = objs[i];
                gameDisplay.drawFrame(obj.animation.getFrame(tick), obj.x, obj.y);
            }
        }

        /** add map objects to manager */
        public addRange(mapObjects: MapObject[]) {
            for (let i = 0; i < mapObjects.length; i++) {
                this.objects.push(mapObjects[i]);
            }

        }

    }
}