
module Lemmings {

    /** uses the LevelReader and GroundReader to render/create the games background */
    export class GroundRenderer {

        public img: Frame;

        constructor() {

        }

        public createVgaspecMap(lr: LevelReader, vr: VgaspecReader)  {
            this.img = vr.img;
        }

        
        /** create the ground image from the level definition and the Terrain images */
        public createGroundMap(lr: LevelReader, terrarImg: TerrainImageInfo[]) {

            this.img = new Frame(lr.levelWidth, lr.levelHeight);

            this.img.clear();

            let terrarObjects: LevelElement[] = lr.terrains;

            for (let i = 0; i < terrarObjects.length; i++) {
                let tOb = terrarObjects[i];
                
                this.copyImageTo(terrarImg[tOb.id], tOb);
            }
        }



        /** copy a terrain image to the ground */
        private copyImageTo(srcImg: TerrainImageInfo, destConfig:LevelElement, frameIndex:number = 0) {
            if (!srcImg) return;

            var pixBuf = srcImg.frames[frameIndex];

            var w = srcImg.width;
            var h = srcImg.height;

            var pal = srcImg.palette;

            var destX = destConfig.x;
            var destY = destConfig.y;

            var upsideDown = destConfig.drawProperties.isUpsideDown;
            var noOverwrite = destConfig.drawProperties.noOverwrite;
            var isErase = destConfig.drawProperties.isErase;
            var onlyOverwrite = destConfig.drawProperties.onlyOverwrite;

            for (var y = 0; y < h; y++) {

                for (var x = 0; x < w; x++) {
   
                    let sourceY = upsideDown ? (h - y - 1) : y;

                    /// read source color index
                    let colorIndex = pixBuf[sourceY * w + x];

                    /// ignore transparent pixels
                    if ((colorIndex & 0x80) != 0) continue;


                    if (isErase) {
                        this.img.clearPixel(x + destX, y + destY);    
                    }
                    else {
                        this.img.setPixel(x + destX, y + destY, pal.data[colorIndex], noOverwrite, onlyOverwrite);
                    }
                }
            }

        }

    }
}