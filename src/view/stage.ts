module Lemmings {

    export class StageImage {
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

        private stageCav: HTMLCanvasElement;
        private gameDisplay : StageImage;
        private guiDisplay : StageImage;

        constructor(canvasForOutput: HTMLCanvasElement) {
            this.stageCav = canvasForOutput;

            this.gameDisplay = new StageImage();

            this.guiDisplay = new StageImage();
            this.guiDisplay.viewPoint = new ViewPoint(0,0,2);
            this.updateStageSize();

            this.clear();
        }


        public updateStageSize() {

            let ctx = this.stageCav.getContext("2d");
        
            let stageHeight = ctx.canvas.height;
            let stageWidth = ctx.canvas.width;

            this.gameDisplay.y = 0;
            this.gameDisplay.height = stageHeight - 100;
            this.gameDisplay.width = stageWidth;

            this.guiDisplay.y = stageHeight - 100;
            this.guiDisplay.height = 100;
            this.guiDisplay.width = stageWidth;
            
        }

        public getGameDisplay():GameDisplay {
            if (this.gameDisplay.display != null) return this.gameDisplay.display;
            this.gameDisplay.display = new GameDisplay(this);
            return this.gameDisplay.display;
        }

        public getGuiDisplay():GameDisplay {
            if (this.guiDisplay.display != null) return this.guiDisplay.display;
            this.guiDisplay.display = new GameDisplay(this);
            return this.guiDisplay.display;
        }

        public setGameDisplayViewPoint(gameViewPoint:ViewPoint) {
            this.gameDisplay.viewPoint = gameViewPoint;
            this.redraw();
        }


        public redraw() {
            if (this.gameDisplay.display != null) {
                let gameImg = this.gameDisplay.display.getImageData();
                this.draw(this.gameDisplay, gameImg);
            };

            if (this.guiDisplay.display != null) {
                let guiImg = this.guiDisplay.display.getImageData();
                this.draw(this.guiDisplay, guiImg);
            };
        }


        public createImage(display:GameDisplay, width:number, height:number): ImageData {
            if (display == this.gameDisplay.display) {
                return this.gameDisplay.createImage(width, height);
            }
            else {
                return this.guiDisplay.createImage(width, height);
            }
        }

        /** clear the stage/display/output */
        public clear() {
            var ctx = this.stageCav.getContext("2d");
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }



        /** draw everything to the stage/display */
        private draw(display:StageImage, img:ImageData) {
            
            if (display.ctx == null) return;

            /// write image to context
            display.ctx.putImageData(img, 0, 0);
            
            let ctx = this.stageCav.getContext("2d");
        
            //@ts-ignore
            ctx.mozImageSmoothingEnabled = false;
            //@ts-ignore
            ctx.webkitImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;

            let outH = display.height;
            let outW = display.width;


            //- Display Layers
            var dW = img.width - display.viewPoint.x; //- display width
            if ((dW * display.viewPoint.scale) > outW) {
                dW = outW / display.viewPoint.scale;
            }

            var dH = img.height - display.viewPoint.y; //- display height
            if ((dH * display.viewPoint.scale) > outH) {
                dH = outH / display.viewPoint.scale;
            }

            //- drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)
            ctx.drawImage(display.cav, display.viewPoint.x, display.viewPoint.y, dW, dH, display.x, display.y, Math.floor(dW * display.viewPoint.scale), Math.floor(dH * display.viewPoint.scale));

        }
    }
}