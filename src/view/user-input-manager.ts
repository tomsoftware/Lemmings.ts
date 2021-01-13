import { EventHandler } from '../utilities/event-handler';
import { Position2D } from '../utilities/position2d';

export class MouseMoveEventArguments extends Position2D {
    /** delta the mouse move Y */
    public deltaX = 0;
    /** delta the mouse move Y */
    public deltaY = 0;

    public button = false;

    /** position the user starts pressed the mouse */
    public mouseDownX = 0;
    /** position the user starts pressed the mouse */
    public mouseDownY = 0;

    constructor(x = 0, y = 0, deltaX = 0, deltaY = 0, button = false) {
        super(x, y);
        this.deltaX = deltaX;
        this.deltaY = deltaY;
        this.button = button;
    }
}

export class ZoomEventArguments extends Position2D {
    public deltaZoom: number;

    constructor(x = 0, y = 0, deltaZoom = 0) {
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

    private mouseButton = false;

    public onMouseMove = new EventHandler<MouseMoveEventArguments>();
    public onMouseUp = new EventHandler<Position2D>();
    public onMouseDown = new EventHandler<Position2D>();
    public onDoubleClick = new EventHandler<Position2D>();
    public onZoom = new EventHandler<ZoomEventArguments>();

    constructor(listenElement: HTMLElement) {

        listenElement.addEventListener('mousemove', (e: MouseEvent) => {
            const relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
            this.handelMouseMove(relativePos);

            e.stopPropagation();
            e.preventDefault();

            return false;
        });


        listenElement.addEventListener('touchmove', (e: TouchEvent) => {
            const relativePos = this.getRelativePosition(listenElement, e.touches[0].clientX, e.touches[0].clientY);
            this.handelMouseMove(relativePos);

            e.stopPropagation();
            e.preventDefault();

            return false;
        });

        listenElement.addEventListener('touchstart', (e: TouchEvent) => {
            const relativePos = this.getRelativePosition(listenElement, e.touches[0].clientX, e.touches[0].clientY);
            this.handelMouseDown(relativePos);

            e.stopPropagation();
            e.preventDefault();

            return false;
        });

        listenElement.addEventListener('mousedown', (e: MouseEvent) => {
            const relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
            this.handelMouseDown(relativePos);

            e.stopPropagation();
            e.preventDefault();

            return false;
        });

        listenElement.addEventListener('mouseup', (e: MouseEvent) => {
            const relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
            this.handelMouseUp(relativePos);

            e.stopPropagation();
            e.preventDefault();

            return false;
        });

        listenElement.addEventListener('mouseleave', () => {
            this.handelMouseClear();
        });

        listenElement.addEventListener('touchend', (e: TouchEvent) => {
            const relativePos = this.getRelativePosition(listenElement, e.touches[0].clientX, e.touches[0].clientY);
            this.handelMouseUp(relativePos);

            return false;
        });

        listenElement.addEventListener('touchcancel', () => {
            this.handelMouseClear();
            return false;
        });


        listenElement.addEventListener('dblclick', (e: MouseEvent) => {
            const relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
            this.handleMouseDoubleClick(relativePos);

            e.stopPropagation();
            e.preventDefault();

            return false;
        });



        listenElement.addEventListener('wheel', (e: WheelEvent) => {
            const relativePos = this.getRelativePosition(listenElement, e.clientX, e.clientY);
            this.handelWheel(relativePos, e.deltaY);

            e.stopPropagation();
            e.preventDefault();

            return false;
        });

    }



    private getRelativePosition(element: HTMLElement, clientX: number, clientY: number): Position2D {

        const rect = element.getBoundingClientRect();

        return new Position2D(clientX - rect.left, clientY - rect.top);
    }


    private handelMouseMove(position: Position2D) {

        //- Move Point of View
        if (this.mouseButton) {

            const deltaX = (this.lastMouseX - position.x);
            const deltaY = (this.lastMouseY - position.y);

            //- save start of Mousedown
            this.lastMouseX = position.x;
            this.lastMouseY = position.y;

            const mouseDragArguments = new MouseMoveEventArguments(position.x, position.y, deltaX, deltaY, true)
            mouseDragArguments.mouseDownX = this.mouseDownX;
            mouseDragArguments.mouseDownY = this.mouseDownY;

            /// raise event
            this.onMouseMove.trigger(mouseDragArguments);
        }
        else {
            /// raise event
            this.onMouseMove.trigger(new MouseMoveEventArguments(position.x, position.y, 0, 0, false));
        }
    }

    private handelMouseDown(position: Position2D) {
        //- save start of Mousedown
        this.mouseButton = true;
        this.mouseDownX = position.x;
        this.mouseDownY = position.y;
        this.lastMouseX = position.x;
        this.lastMouseY = position.y;

        /// create new event handler
        this.onMouseDown.trigger(position);
    }

    private handleMouseDoubleClick(position: Position2D) {
        this.onDoubleClick.trigger(position);
    }

    private handelMouseClear() {
        this.mouseButton = false;
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
    private handelWheel(position: Position2D, deltaY: number) {

        if (deltaY < 0) {
            this.onZoom.trigger(new ZoomEventArguments(position.x, position.y, 1));
        }
        if (deltaY > 0) {
            this.onZoom.trigger(new ZoomEventArguments(position.x, position.y, -1));
        }
    }


}
