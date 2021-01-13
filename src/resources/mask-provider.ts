import { BinaryReader } from './file/binary-reader';
import { MaskList } from './mask-list';
import { MaskTypes } from './mask-types';

/** manage the in-game masks a lemming can use to change the map */
export class MaskProvider {

    private maskList: MaskList[] = [];

    public GetMask(maskTypes: MaskTypes): MaskList {
        return this.maskList[maskTypes];
    }

    constructor(fr: BinaryReader) {

        this.maskList[MaskTypes.BASHING_R] = MaskList.fromFile(fr, 16, 10, 4, -8, -10);
        this.maskList[MaskTypes.BASHING_L] = MaskList.fromFile(fr, 16, 10, 4, -8, -10);
        this.maskList[MaskTypes.MINEING_R] = MaskList.fromFile(fr, 16, 13, 2, -8, -12);
        this.maskList[MaskTypes.MINEING_L] = MaskList.fromFile(fr, 16, 13, 2, -8, -12);
        this.maskList[MaskTypes.EXPLODING] = MaskList.fromFile(fr, 16, 22, 1, -8, -14);
        this.maskList[MaskTypes.NUMBERS] = MaskList.fromFile(fr, 8, 8, 10, -1, -19);

    }
}
