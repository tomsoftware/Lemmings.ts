
module Lemmings {

    /** a mask */
    export class MaskList {

        private frames:Mask[];

        constructor(fr:BinaryReader, width:number, height:number, count:number, offsetX:number, offsetY:number) {
            
            if(fr != null) {
                this.loadFromFile(fr, width, height, count, offsetX, offsetY);
            }
        }

        public get lenght():number {
            return frames.length;
        }

        public GetMask(index:number):Mask {
            return this.frames[index];
        }

        public loadFromFile(fr:BinaryReader, width:number, height:number, count:number, offsetX:number, offsetY:number): void {
 
            this.frames = [];

            for(let i=0; i<count;i++) {
                let mask = new Mask(fr, width, height,  offsetX, offsetY);
  
                this.frames.push(mask);

            }
        }


    }

}