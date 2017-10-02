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

        public SetViewRange(minX:number, minY:number, maxX:number, maxY:number){
            this.minX = minX;
            this.minY = minY;

            this.maxX = maxX;
            this.maxY = maxY;
        }


        public onViewPointChanged: (viewPoint:ViewPoint) => void;



        constructor(private listenElement: HTMLElement) {

            listenElement.addEventListener("mousemove", (e: MouseEvent) => {
                this.HandelMouseMove(e.clientX, e.clientY);
            });


            listenElement.addEventListener("touchmove", (e: TouchEvent) => {
                this.HandelMouseMove(e.touches[0].clientX, e.touches[0].clientY);
            });

            listenElement.addEventListener("touchstart", (e: TouchEvent) => {
                this.HandelMouseDown(e.touches[0].clientX, e.touches[0].clientY, 0, e.currentTarget);
            });

            listenElement.addEventListener("mousedown", (e: MouseEvent) => {
                this.HandelMouseDown(e.clientX, e.clientY, e.button, e.currentTarget);
            });

            listenElement.addEventListener("mouseup", (e: MouseEvent) => {
                this.HandelMouseUp();
            });

            listenElement.addEventListener("mouseleave", (e: MouseEvent) => {
                this.HandelMouseUp();
            });

            listenElement.addEventListener("touchend", (e: TouchEvent) => {
                this.HandelMouseUp();
            });

            listenElement.addEventListener("touchleave", (e: TouchEvent) => {
                this.HandelMouseUp();
            });

            listenElement.addEventListener("touchcancel", (e: TouchEvent) => {
                this.HandelMouseUp();
            });


            listenElement.addEventListener("wheel", (e: WheelEvent) => {
                this.HandeWheel(e);
            });

        }


        private HandelMouseMove(x: number, y: number) {

            //- Move Point of View
            if (this.mouseDownButton == 0) {
            

                this.viewX = this.mouseDownViewX + (this.mouseDownX - x) / this.viewScale;
                this.viewY = this.mouseDownViewY + (this.mouseDownY - y) / this.viewScale;

                this.viewX = Math.min(this.viewX, this.maxX);
                this.viewX = Math.max(this.viewX, this.minX);

                this.viewY = Math.min(this.viewY, this.maxY);
                this.viewY = Math.max(this.viewY, this.minY);

                this.onViewPointChanged(new ViewPoint(this.viewX, this.viewY, this.viewScale));

            }
        }


        private HandelMouseDown(x, y, button, currentTarget) {
  
            //- save start of Mousedown
            this.mouseDownViewX = this.viewX;
            this.mouseDownViewY = this.viewY;
            this.mouseDownX = x;
            this.mouseDownY = y;
            this.mouseDownButton = button;
        }





        private HandelMouseUp() {
            this.mouseDownX = -1;
            this.mouseDownY = -1;
            this.mouseDownButton = -1;
        }



        /** Zoom view 
         * todo: zoom to mouse pointer */ 
        private HandeWheel(e: WheelEvent) {
            
            if (e.deltaY < 0) {
                this.viewScale += 0.5;
                if (this.viewScale > 10) this.viewScale = 10;
            }
            if (e.deltaY > 0) {
                this.viewScale -= 0.5;
                if (this.viewScale < 0.5) this.viewScale = 0.5;
            }

            this.onViewPointChanged(new ViewPoint(this.viewX, this.viewY, this.viewScale));
        }
    }
}