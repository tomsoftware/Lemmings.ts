
module Lemmings {

    /** uses the LevelReader and GroundReader to render the games background */
    export class GroundRenderer {

        public img: GroundImage;

        constructor() {

        }

        public readVgaspecMap(lr: LevelReader, vr: VgaspecReader)  {
            this.img = vr.img;
        }

        
        /** create the ground image from the level definition and the Terrain images */
        public readGroundMap(lr: LevelReader, gr: GroundReader) {

            this.img = new GroundImage(lr.levelWidth, lr.levelHeight);

            this.img.clearImageArray();

            let terrarObjects: LevelElement[] = lr.terrains;
            let terrarImg: TerrainImageInfo[] = gr.imgTerrar;

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

            var pal = srcImg.pallet;

            var destX = destConfig.x;
            var destY = destConfig.y;

            var upsideDown = destConfig.isUpsideDown;
            var noOverwrite = destConfig.noOverwrite;
            var isErase = destConfig.isErase;
            var onlyOverwrite = destConfig.onlyOverwrite;

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