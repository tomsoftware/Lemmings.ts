
module Lemmings {

    /** manage the in-game Masks a leming can use to change the map */
    export class MaskProvider {

        private maskList:MaskList[] = [];

        public GetMask(maskTypes:MaskTypes):MaskList {
            return this.maskList[maskTypes];
        }

        constructor(fr:BinaryReader) {
          
            this.maskList[MaskTypes.BASHING_R] = new MaskList(fr, 16, 10,  4, -8, -10);
            this.maskList[MaskTypes.BASHING_L] = new MaskList(fr, 16, 10,  4, -8, -10);
            this.maskList[MaskTypes.MINEING_R] = new MaskList(fr, 16, 13,  2, -8, -12);
            this.maskList[MaskTypes.MINEING_L] = new MaskList(fr, 16, 13,  2, -8, -12);
            this.maskList[MaskTypes.EXPLODING] = new MaskList(fr, 16, 22,  1, -8, -14);
            this.maskList[MaskTypes.NUMBERS]   = new MaskList(fr,  8,  8, 10, -1, -19);

        }


    }

}