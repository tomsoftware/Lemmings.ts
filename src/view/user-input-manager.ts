module Lemmings {

    export class MouseMoveEventArguemnts extends Position2D {
        /** delta the mouse move Y */
        public deltaX: number = 0;
        /** delta the mouse move Y */
        public deltaY: number = 0;

        public button: boolean = false;

        /** position the user starts pressed the mouse */
        public mouseDownX: number = 0;
        /** position the user starts pressed the mouse */
        public mouseDownY: number = 0;

        constructor(x: number = 0, y: number = 0, deltaX: number = 0, deltaY: number = 0, button: boolean = false) {
            super(x, y);
            this.deltaX = deltaX;
            this.deltaY = deltaY;
            this.button = button;
        }
    }

    export class ZoomEventArguemnts extends Position2D {
        public deltaZoom: number;

        constructor(x: number = 0, y: number = 0, deltaZoom: number = 0) {
            super(x, y);
            this.deltaZoom = deltaZoom;
        }
    }


    /** handel the user events on the stage */
    export class UserInputManager {

        private mouseDownX = 0;
        private mouseDownY = 0;

        private lastMouseX = 0;
        private lastMouseY = 0;

        private mouseButton = -1;

        public onMouseMove = new EventHandler<MouseMoveEventArguemnts>();
        public onMouseUp = new EventHandler<Position2D>();
        public onMouseDown = new EventHandler<Position2D>();
        public onDoubleClick = new EventHandler<Position2D>();
        public onZoom = new EventHandler<ZoomEventArguemnts>();

        constructor(listenElement: HTMLElement) {

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
                this.handelMouseDown(relativePos, 1);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("mousedown", (e: MouseEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handelMouseDown(relativePos, e.button);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("mouseup", (e: MouseEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handelMouseUp(relativePos);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            listenElement.addEventListener("mouseleave", (e: MouseEvent) => {
                this.handelMouseClear();
            });

            listenElement.addEventListener("touchend", (e: TouchEvent) => {
                this.handelMouseClear();
                return false;
            });

            listenElement.addEventListener("touchleave", (e: TouchEvent) => {
                this.handelMouseClear();
                return false;
            });

            listenElement.addEventListener("touchcancel", (e: TouchEvent) => {
                this.handelMouseClear();
                return false;
            });

            
            listenElement.addEventListener("dblclick", (e: MouseEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handleMouseDoubleClick(relativePos);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });



            listenElement.addEventListener("wheel", (e: WheelEvent) => {
                let relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
                this.handeWheel(relativePos, e.deltaY);

                e.stopPropagation();
                e.preventDefault();
                return false;
            });

        }



        private getRelativePosition(element: HTMLElement, clientX: number, clientY: number): Position2D {

            var rect = element.getBoundingClientRect();

            return new Position2D(clientX - rect.left, clientY - rect.top);
        }


        private handelMouseMove(position: Position2D) {

            //- Move Point of View
            if (this.mouseButton == 0) {

                let deltaX = (this.lastMouseX - position.x);
                let deltaY = (this.lastMouseY - position.y);

                //- save start of Mousedown
                this.lastMouseX = position.x;
                this.lastMouseY = position.y;

                let mouseDragArguments = new MouseMoveEventArguemnts(position.x, position.y, deltaX, deltaY, true)
                mouseDragArguments.mouseDownX = this.mouseDownX;
                mouseDragArguments.mouseDownY = this.mouseDownY;

                /// raise event
                this.onMouseMove.trigger(mouseDragArguments);
            }
            else {
                /// raise event
                this.onMouseMove.trigger(new MouseMoveEventArguemnts(position.x, position.y, 0, 0, false));
            }
        }

        private handelMouseDown(position: Position2D, button: number) {
            //- save start of Mousedown
            this.mouseButton = button;
            this.mouseDownX = position.x;
            this.mouseDownY = position.y;
            this.lastMouseX = position.x;
            this.lastMouseY = position.y;

            if (this.mouseButton == 0) {
                /// create new event handler
                this.onMouseDown.trigger(position);
            }
        }

        private handleMouseDoubleClick(position: Position2D) {
            this.onDoubleClick.trigger(position);
        }

        private handelMouseClear() {
            this.mouseButton = -1;
            this.mouseDownX = 0;
            this.mouseDownY = 0;
            this.lastMouseX = 0;
            this.lastMouseY = 0;
        }

        private handelMouseUp(position: Position2D) {
            this.handelMouseClear();

            this.onMouseUp.trigger(new Position2D(position.x, position.y));
        }

        /** Zoom view 
         * todo: zoom to mouse pointer */
        private handeWheel(position: Position2D, deltaY: number) {

            if (deltaY < 0) {
                this.onZoom.trigger(new ZoomEventArguemnts(position.x, position.y, 1));
            }
            if (deltaY > 0) {
                this.onZoom.trigger(new ZoomEventArguemnts(position.x, position.y, -1));
            }
        }


    }
}