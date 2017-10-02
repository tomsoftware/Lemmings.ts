module Lemmings {
    
        export class Frame {
            width:number = 0;
            height:number = 0;
            data:Uint8Array;
 
            public constructor(width:number, height:number, data:Uint8Array) {
                this.width = width;
                this.height = height;
                this.data = data;
            }

            public getXPos(){
                return Math.floor(this.width / 2);
            }

            public getYPos(){
                return this.height - 1;
            }
            
        }
    }
    