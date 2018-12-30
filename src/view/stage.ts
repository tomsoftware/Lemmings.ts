module Lemmings {

    export class ContextImage extends ImageData {
        public ctx: CanvasRenderingContext2D;
        public cav: HTMLCanvasElement;
    }

    /** handel the display of the game */
    export class Stage {

        private outputCav: HTMLCanvasElement;
        private gameDisplay : GameDisplay = null;
        private gameViewPoint: ViewPoint = new ViewPoint(0, 0, 1);

        constructor(canvasForOutput: HTMLCanvasElement) {
            this.outputCav = canvasForOutput;
            this.clear();
        }

        public getGameDisplay() {
            if (this.gameDisplay != null) return this.gameDisplay;
            this.gameDisplay = new GameDisplay(this);
            return this.gameDisplay;
        }

        public setGameDisplayViewPoint(gameViewPoint:ViewPoint) {
            this.gameViewPoint = gameViewPoint;
            this.redraw();
        }


        public redraw() {
            if (this.gameDisplay == null) return;

            let gameImg = this.gameDisplay.getImageData();
            this.draw(gameImg, this.gameViewPoint.x, this.gameViewPoint.y, this.gameViewPoint.scale);
        }


        public createImage(width:number, height:number): ContextImage {
            let processCav = document.createElement('canvas');

            processCav.width = width;
            processCav.height = height;

            let processCtx = processCav.getContext("2d");

            let img:any = processCtx.createImageData(width, height);
            img.ctx = processCtx;
            img.cav = processCav;

            /// create image
            return (img as ContextImage);
        }


        public clear() {
            var ctx = this.outputCav.getContext("2d");
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }



        /** draw everything to the display */
        private draw(img:ContextImage, viewX:number, viewY:number, viewScale:number) {
            
            if (img.ctx == null) return;

            /// write image to context
            img.ctx.putImageData(img, 0, 0);
            
            let ctx = this.outputCav.getContext("2d");
        
            //@ts-ignore
            ctx.mozImageSmoothingEnabled = false;
            //@ts-ignore
            ctx.webkitImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;

            let outGameH = ctx.canvas.height;
            let outW = ctx.canvas.width;


            //- Display Layers
            var dW = img.width - viewX; //- display width
            if ((dW * viewScale) > outW) {
                dW = outW / viewScale;
            }

            var dH = img.height - viewY; //- display height
            if ((dH * viewScale) > outGameH) {
                dH = outGameH / viewScale;
            }

            //- drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)
            ctx.drawImage(img.cav, viewX, viewY, dW, dH, 0, 0, Math.floor(dW * viewScale), Math.floor(dH * viewScale));

        }
    }
}