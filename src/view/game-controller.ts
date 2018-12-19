module Lemmings {

    /** handel the display of the game */
    export class GameController {

        private mouseDownX = -1;
        private mouseDownY = -1;
        private mouseDownButton = -1;

        private viewX = 0;
        private viewY = 0;
        private viewScale = 1;

        private mouseDownViewX = 0;
        private mouseDownViewY = 0;

        private minX = 0;
        private minY = 0;
        private maxX = 0;
        private maxY = 0;

        private currentViewPoint: ViewPoint = null;

        public setViewRange(minX:number, minY:number, maxX:number, maxY:number){
            this.minX = minX;
            this.minY = minY;

            this.maxX = maxX;
            this.maxY = maxY;
        }


        public onViewPointChanged: (viewPoint:ViewPoint) => void;

        public onMouseMove: (x:number, y:number) => void;
        public onMouseClick: (x:number, y:number) => void;


        constructor(private listenElement: HTMLElement) {

            listenElement.addEventListener("mousemove", (e: MouseEvent) => {
                this.handelMouseMove(e.clientX, e.clientY);
            });


            listenElement.addEventListener("touchmove", (e: TouchEvent) => {
                this.handelMouseMove(e.touches[0].clientX, e.touches[0].clientY);
            });

            listenElement.addEventListener("touchstart", (e: TouchEvent) => {
                this.handelMouseDown(e.touches[0].clientX, e.touches[0].clientY, 0, e.currentTarget);
            });

            listenElement.addEventListener("mousedown", (e: MouseEvent) => {
                this.handelMouseDown(e.clientX, e.clientY, e.button, e.currentTarget);
            });

            listenElement.addEventListener("mouseup", (e: MouseEvent) => {
                this.handelMouseUp();
            });

            listenElement.addEventListener("mouseleave", (e: MouseEvent) => {
                this.handelMouseUp();
            });

            listenElement.addEventListener("touchend", (e: TouchEvent) => {
                this.handelMouseUp();
            });

            listenElement.addEventListener("touchleave", (e: TouchEvent) => {
                this.handelMouseUp();
            });

            listenElement.addEventListener("touchcancel", (e: TouchEvent) => {
                this.handelMouseUp();
            });


            listenElement.addEventListener("wheel", (e: WheelEvent) => {
                this.handeWheel(e);
            });

        }


        private handelMouseMove(x: number, y: number) {

            //- Move Point of View
            if (this.mouseDownButton == 0) {
            
                this.viewX = this.mouseDownViewX + (this.mouseDownX - x) / this.viewScale;
                this.viewY = this.mouseDownViewY + (this.mouseDownY - y) / this.viewScale;

                this.viewX = Math.min(this.viewX, this.maxX);
                this.viewX = Math.max(this.viewX, this.minX);

                this.viewY = Math.min(this.viewY, this.maxY);
                this.viewY = Math.max(this.viewY, this.minY);

                this.raiseViewPointChanged(this.viewX, this.viewY, this.viewScale);
            }

            /// raise event
            if (this.onMouseMove) this.onMouseMove(this.currentViewPoint.getSceneX(x), this.currentViewPoint.getSceneY(y));
        }


        private handelMouseDown(x:number, y:number, button:number, currentTarget) {
  
            //- save start of Mousedown
            this.mouseDownViewX = this.viewX;
            this.mouseDownViewY = this.viewY;
            this.mouseDownX = x;
            this.mouseDownY = y;
            this.mouseDownButton = button;

            /// raise event
            if (this.onMouseClick) this.onMouseClick(this.currentViewPoint.getSceneX(x), this.currentViewPoint.getSceneY(y));
        }



        private handelMouseUp() {
            this.mouseDownX = -1;
            this.mouseDownY = -1;
            this.mouseDownButton = -1;
        }



        /** Zoom view 
         * todo: zoom to mouse pointer */ 
        private handeWheel(e: WheelEvent) {
            
            if (e.deltaY < 0) {
                this.viewScale += 0.5;
                if (this.viewScale > 10) this.viewScale = 10;
            }
            if (e.deltaY > 0) {
                this.viewScale -= 0.5;
                if (this.viewScale < 0.5) this.viewScale = 0.5;
            }

            this.raiseViewPointChanged(this.viewX, this.viewY, this.viewScale);
        }


        private raiseViewPointChanged(x:number, y:number, scale:number) {
            this.currentViewPoint = new ViewPoint(x, y, scale);
            
            if (this.onViewPointChanged) {
                this.onViewPointChanged(this.currentViewPoint);
            }
        }
    }
}