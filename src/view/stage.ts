module Lemmings {

    export class StageImageProperties {
        public ctx: CanvasRenderingContext2D;
        public cav: HTMLCanvasElement;
        /** X position to display this Image */
        public x:number = 0;
        /** Y position to display this Image */
        public y:number = 0;

        public width:number = 0;
        public height:number = 0;

        public display : DisplayImage = null;
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
        private gameImgProps : StageImageProperties;
        private guiImgProps : StageImageProperties;

        private controller : UserInputManager = null;

        constructor(canvasForOutput: HTMLCanvasElement) {
            this.controller = new UserInputManager(canvasForOutput);

            this.controller.onMouseClick.on((e) => {
                let stageImage = this.getStageImageAt(e.x, e.y);
                if (stageImage == null) return;
                if (stageImage.display == null) return;

                let x = (stageImage.viewPoint.getSceneX(e.x - stageImage.x));
                let y = (stageImage.viewPoint.getSceneY(e.y - stageImage.y));

                stageImage.display.onMouseClick.trigger(new Position2D(x, y));
            });


            this.controller.onMouseMove.on((e) => {
                if (e.button) {
                    let stageImage = this.getStageImageAt(e.mouseDownX, e.mouseDownY);
                    if (stageImage == null) return;

                    if (stageImage == this.gameImgProps) {
                        this.updateViewPoint(stageImage, e.deltaX, e.deltaY, 0);
                    }
                }
                else {
                    let stageImage = this.getStageImageAt(e.x, e.y);
                    if (stageImage == null) return;
                    if (stageImage.display == null) return;

                    let x = e.x - stageImage.x;
                    let y = e.y - stageImage.y;    

                    stageImage.display.onMouseMove.trigger(new Position2D(stageImage.viewPoint.getSceneX(x), stageImage.viewPoint.getSceneY(y)));
                }
            });


            this.controller.onZoom.on((e) => {
                let stageImage = this.getStageImageAt(e.x, e.y);
                if (stageImage == null) return;
                this.updateViewPoint(stageImage, 0, 0, e.deltaZoom);
            });


            this.stageCav = canvasForOutput;

            this.gameImgProps = new StageImageProperties();

            this.guiImgProps = new StageImageProperties();
            this.guiImgProps.viewPoint = new ViewPoint(0,0,2);
            this.updateStageSize();

            this.clear();
        }


        private updateViewPoint(stageImage:StageImageProperties, deltaX:number, deltaY:number, deletaZoom:number) {
            stageImage.viewPoint.x += deltaX / stageImage.viewPoint.scale;
            stageImage.viewPoint.y += deltaY / stageImage.viewPoint.scale;
            stageImage.viewPoint.scale += deletaZoom * 0.5;

            stageImage.viewPoint.x = this.limitValue(0, stageImage.viewPoint.x, stageImage.width);
            stageImage.viewPoint.y = this.limitValue(0, stageImage.viewPoint.y, stageImage.height);
            stageImage.viewPoint.scale = this.limitValue(0.5, stageImage.viewPoint.scale, 10);

            this.clear();
            this.redraw();
        }

        private limitValue(minLimit:number, value:number, maxLimit:number) :number {
            return Math.min(Math.max(minLimit, value), maxLimit);
        }

        public updateStageSize() {

            let ctx = this.stageCav.getContext("2d");
        
            let stageHeight = ctx.canvas.height;
            let stageWidth = ctx.canvas.width;

            this.gameImgProps.y = 0;
            this.gameImgProps.height = stageHeight - 100;
            this.gameImgProps.width = stageWidth;

            this.guiImgProps.y = stageHeight - 100;
            this.guiImgProps.height = 100;
            this.guiImgProps.width = stageWidth;
            
        }

        public getStageImageAt(x: number, y:number):StageImageProperties {
            if (this.isPositionInStageImage(this.gameImgProps, x, y)) return this.gameImgProps;
            if (this.isPositionInStageImage(this.guiImgProps, x, y)) return this.guiImgProps;
            return null;
        }

        private isPositionInStageImage(stageImage:StageImageProperties, x: number, y:number) {
            return ((stageImage.x <= x) && ((stageImage.x + stageImage.width) >= x)
             && (stageImage.y <= y) && ((stageImage.y + stageImage.height) >= y));
        }

        public getGameDisplay():DisplayImage {
            if (this.gameImgProps.display != null) return this.gameImgProps.display;
            this.gameImgProps.display = new DisplayImage(this);
            return this.gameImgProps.display;
        }

        public getGuiDisplay():DisplayImage {
            if (this.guiImgProps.display != null) return this.guiImgProps.display;
            this.guiImgProps.display = new DisplayImage(this);
            return this.guiImgProps.display;
        }

        public setGameDisplayViewPoint(gameViewPoint:ViewPoint) {
            this.gameImgProps.viewPoint = gameViewPoint;
            this.redraw();
        }


        public redraw() {
            if (this.gameImgProps.display != null) {
                let gameImg = this.gameImgProps.display.getImageData();
                this.draw(this.gameImgProps, gameImg);
            };

            if (this.guiImgProps.display != null) {
                let guiImg = this.guiImgProps.display.getImageData();
                this.draw(this.guiImgProps, guiImg);
            };
        }


        public createImage(display:DisplayImage, width:number, height:number): ImageData {
            if (display == this.gameImgProps.display) {
                return this.gameImgProps.createImage(width, height);
            }
            else {
                return this.guiImgProps.createImage(width, height);
            }
        }

        /** clear the stage/display/output */
        public clear() {
            var ctx = this.stageCav.getContext("2d");
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }



        /** draw everything to the stage/display */
        private draw(display:StageImageProperties, img:ImageData) {
            
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