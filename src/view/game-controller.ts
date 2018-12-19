module Lemmings {
    class Vector2D  {
        public x:number;
        public y:number;
    }

    /** handel the display of the game */
    export class GameController {

        private mouseDownX = -1;
        private mouseDownY = -1;
        private mouseDownButton = -1;

        private mouseDownViewX = 0;
        private mouseDownViewY = 0;

        private minX = 0;
        private minY = 0;
        private maxX = 0;
        private maxY = 0;

        private currentViewPoint: ViewPoint = null;


        public onViewPointChanged: (viewPoint:ViewPoint) => void;
        public onMouseMove: (x:number, y:number) => void;
        public onMouseClick: (x:number, y:number) => void;

        constructor(private listenElement: HTMLElement) {

            this.setViewPoint(0, 0, 1);

            listenElement.addEventListener("mousemove", (e: MouseEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handelMouseMove(relativePos);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });


            listenElement.addEventListener("touchmove", (e: TouchEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.touches[0].clientX, e.touches[0].clientY);
                this.handelMouseMove(relativePos);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("touchstart", (e: TouchEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.touches[0].clientX, e.touches[0].clientY);
                this.handelMouseDown(relativePos, 0, e.currentTarget);
                
                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("mousedown", (e: MouseEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handelMouseDown(relativePos, e.button, e.currentTarget);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("mouseup", (e: MouseEvent) => {
                this.handelMouseUp();

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("mouseleave", (e: MouseEvent) => {
                this.handelMouseUp();
            });

            listenElement.addEventListener("touchend", (e: TouchEvent) => {
                this.handelMouseUp();
                return false;
            });

            listenElement.addEventListener("touchleave", (e: TouchEvent) => {
                this.handelMouseUp();
                return false;
            });

            listenElement.addEventListener("touchcancel", (e: TouchEvent) => {
                this.handelMouseUp();
                return false;
            });


            listenElement.addEventListener("wheel", (e: WheelEvent) => {
                this.handeWheel(e);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

        }

        public setViewPoint(x: number, y:number, scale:number) {

            x = Math.min(x, this.maxX);
            x = Math.max(x, this.minX);

            y = Math.min(y, this.maxY);
            y = Math.max(y, this.minY);

            this.currentViewPoint = new ViewPoint(x, y, scale);
            
            if (this.onViewPointChanged) {
                this.onViewPointChanged(this.currentViewPoint);
            }
        }

        
        public setViewRange(minX:number, minY:number, maxX:number, maxY:number){
            this.minX = minX;
            this.minY = minY;

            this.maxX = maxX;
            this.maxY = maxY;
        }

        private getRelativePosition(element: HTMLElement, clientX:number, clientY:number):Vector2D {

            var rect = element.getBoundingClientRect();

            return { x: clientX - rect.left, y: clientY - rect.top};
        }


        private handelMouseMove(position:Vector2D) {

            //- Move Point of View
            if (this.mouseDownButton == 0) {
            
                let x = this.mouseDownViewX + (this.mouseDownX - position.x) / this.currentViewPoint.scale;
                let y = this.mouseDownViewY + (this.mouseDownY - position.y) / this.currentViewPoint.scale;

                this.setViewPoint(x, y, this.currentViewPoint.scale);
            }

            /// raise event
            if (this.onMouseMove) this.onMouseMove(this.currentViewPoint.getSceneX(position.x), this.currentViewPoint.getSceneY(position.y));
        }


        private handelMouseDown(position:Vector2D, button:number, currentTarget) {
  
            //- save start of Mousedown
            this.mouseDownViewX = this.currentViewPoint.x;
            this.mouseDownViewY = this.currentViewPoint.y;
            this.mouseDownX = position.x;
            this.mouseDownY = position.y;
            this.mouseDownButton = button;

            /// raise event
            if (this.onMouseClick) this.onMouseClick(this.currentViewPoint.getSceneX(position.x), this.currentViewPoint.getSceneY(position.y));
        }



        private handelMouseUp() {
            this.mouseDownX = -1;
            this.mouseDownY = -1;
            this.mouseDownButton = -1;
        }



        /** Zoom view 
         * todo: zoom to mouse pointer */ 
        private handeWheel(e: WheelEvent) {

            let scale = this.currentViewPoint.scale;
            if (e.deltaY < 0) {
                scale = Math.min(10, scale + 0.5);
            }
            if (e.deltaY > 0) {
                scale = Math.max(0.5, scale - 0.5);
            }

            this.setViewPoint(this.currentViewPoint.x, this.currentViewPoint.y, scale);
        }


    }
}