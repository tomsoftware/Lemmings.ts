module Lemmings {

    export class ContextImage {
        public ctx: CanvasRenderingContext2D;
        public cav: HTMLCanvasElement;
        /** X position to display this Image */
        public x:number = 0;
        /** Y position to display this Image */
        public y:number = 0;

        public width:number = 0;
        public height:number = 0;

        public display : GameDisplay = null;
        public viewPoint: ViewPoint = new ViewPoint(0, 0, 1);

        public createImage(width:number, height:number) {
            this.cav = document.createElement('canvas');

            this.cav.width = width;
            this.cav.height = height;

            this.ctx = this.cav.getContext("2d");

            return this.ctx.createImageData(width, height);
        }
    }


    /** handel the display / output of game, gui, ... */
    export class Stage {

        private outputCav: HTMLCanvasElement;
        private gameDisplay : ContextImage;

        constructor(canvasForOutput: HTMLCanvasElement) {
            this.outputCav = canvasForOutput;

            this.gameDisplay = new ContextImage();

            this.clear();
        }

        public getGameDisplay():GameDisplay {
            if (this.gameDisplay.display != null) return this.gameDisplay.display;
            this.gameDisplay.display = new GameDisplay(this);
            return this.gameDisplay.display;
        }

        public setGameDisplayViewPoint(gameViewPoint:ViewPoint) {
            this.gameDisplay.viewPoint = gameViewPoint;
            this.redraw();
        }


        public redraw() {
            if (this.gameDisplay == null) return;

            let gameImg = this.gameDisplay.display.getImageData();
            this.draw(this.gameDisplay, gameImg);
        }


        public createImage(display:GameDisplay, width:number, height:number): ImageData {
            return this.gameDisplay.createImage(width, height);
        }

        /** clear the stage/display/output */
        public clear() {
            var ctx = this.outputCav.getContext("2d");
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }



        /** draw everything to the stage/display */
        private draw(display:ContextImage, img:ImageData) {
            
            if (display.ctx == null) return;

            /// write image to context
            display.ctx.putImageData(img, 0, 0);
            
            let ctx = this.outputCav.getContext("2d");
        
            //@ts-ignore
            ctx.mozImageSmoothingEnabled = false;
            //@ts-ignore
            ctx.webkitImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;

            let outGameH = ctx.canvas.height;
            let outW = ctx.canvas.width;


            //- Display Layers
            var dW = img.width - display.viewPoint.x; //- display width
            if ((dW * display.viewPoint.scale) > outW) {
                dW = outW / display.viewPoint.scale;
            }

            var dH = img.height - display.viewPoint.y; //- display height
            if ((dH * display.viewPoint.scale) > outGameH) {
                dH = outGameH / display.viewPoint.scale;
            }

            //- drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)
            ctx.drawImage(display.cav, display.viewPoint.x, display.viewPoint.y, dW, dH, 0, 0, Math.floor(dW * display.viewPoint.scale), Math.floor(dH * display.viewPoint.scale));

        }
    }
}