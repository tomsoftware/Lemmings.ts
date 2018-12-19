module Lemmings {
    
        /** image frame with index color */
        export class Frame {
            public width:number = 0;
            public height:number = 0;
            public offsetX:number = 0;
            public offsetY:number = 0;

            public data:Uint8Array;
 
            public constructor(width:number, height:number, data:Uint8Array) {
                this.width = width;
                this.height = height;
                this.data = data;
                this.offsetX = Math.floor(this.width / 2);
                this.offsetY = this.height;
            }
            
        }
    }
    