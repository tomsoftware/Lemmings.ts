import { LogHandler } from '@/game/utilities/log-handler';

/** Class to provide a read pointer and read functions to a binary Buffer */
export class BinaryReader {

  private log: LogHandler = new LogHandler('BinaryReader');
  public fileName: string;
  public length: number;
  public pos: number;

  protected data: Uint8Array;
  protected hiddenOffset: number;


  constructor(dataArray?: BinaryReader | Uint8Array | ArrayBuffer | Blob, offset: number | null = null, length: number | null = null, filename = '[unknown]') {

    this.fileName = filename;

    offset = offset || 0;

    let dataLength = 0;

    if (dataArray == null) {
      this.data = new Uint8Array(0);
      dataLength = 0;
      this.log.log('BinaryReader from NULL; size:' + 0);

    } else if (dataArray instanceof BinaryReader) {
      //- if dataArray is BinaryReader use there data
      this.data = dataArray.data;
      dataLength = dataArray.length;
      this.log.log('BinaryReader from BinaryReader; size:' + dataLength);

    } else if (dataArray instanceof Uint8Array) {
      this.data = dataArray;
      dataLength = dataArray.byteLength;
      this.log.log('BinaryReader from Uint8Array; size:' + dataLength);

    }
    else if (dataArray instanceof ArrayBuffer) {
      this.data = new Uint8Array(dataArray);
      dataLength = dataArray.byteLength;
      this.log.log('BinaryReader from ArrayBuffer; size:' + dataLength);
    }
    else if (dataArray instanceof Blob) {
      this.data = new Uint8Array();
      dataLength = 0;
      this.log.log('Error: not supported - BinaryReader from Blob; size:' + dataLength);
    }
    else {
      this.data = dataArray;
      dataLength = this.data.length;
      this.log.log('BinaryReader from unknown: ' + dataArray + '; size:' + dataLength);
    }

    if (length == null) length = dataLength - offset;

    this.hiddenOffset = offset;
    this.length = length;
    this.pos = this.hiddenOffset;

  }



  /** Read one Byte from stream */
  public readByte(offset?: number): number {
    if (offset != null) this.pos = (offset + this.hiddenOffset);

    if ((this.pos < 0) || (this.pos > this.data.length)) {
      this.log.log('read out of data: ' + this.fileName + ' - size: ' + this.data.length + ' @ ' + this.pos);
      return 0;
    }

    const v: number = this.data[this.pos];
    this.pos++;

    return v;
  }


  /** Read one DWord (4 Byte) from stream (little ending) */
  public readInt(length = 4, offset = -1): number {

    if (offset < 0) {
      offset = this.pos;
    }

    if (length == 4) {
      const v: number = (this.data[offset] << 24) | (this.data[offset + 1] << 16) | (this.data[offset + 2] << 8) | (this.data[offset + 3]);
      this.pos = offset + 4;
      return v;
    }

    let v = 0;
    for (let i = length; i > 0; i--) {
      v = (v << 8) | this.data[offset];
      offset++;
    }

    this.pos = offset;

    return v;
  }

  /** Read one DWord (4 Byte) from stream (big ending) */
  public readIntBE(offset?: number): number {

    if (offset == null) {
      offset = this.pos;
    }

    const v: number = (this.data[offset]) | (this.data[offset + 1] << 8) | (this.data[offset + 2] << 16) | (this.data[offset + 3] << 24);
    this.pos = offset + 4;

    return v;
  }


  /** Read one Word (2 Byte) from stream (big ending) */
  public readWord(offset = -1): number {
    if (offset < 0) {
      offset = this.pos;
    }

    const v: number = (this.data[offset] << 8) | (this.data[offset + 1]);
    this.pos = offset + 2;

    return v;
  }

  /** Read one Word (2 Byte) from stream (big ending) */
  public readWordBE(offset = -1): number {
    if (offset < 0) {
      offset = this.pos;
    }

    const v: number = (this.data[offset]) | (this.data[offset + 1] << 8);
    this.pos = offset + 2;

    return v;
  }


  /** Read a String */
  public readString(length: number, offset = -1): string {

    if (offset < 0) {
      this.pos = offset + this.hiddenOffset;
    }

    let result = '';

    for (let i = 0; i < length; i++) {
      const v: number = this.data[this.pos];
      this.pos++;

      result += String.fromCharCode(v);
    }
    return result;

  }

  /** return the current curser position */
  public getOffset(): number {
    return this.pos - this.hiddenOffset;
  }

  /** set the current curser position */
  public setOffset(newPos: number) {
    this.pos = newPos + this.hiddenOffset;
  }

  /** return true if the curser position is out of data */
  public eof(): boolean {
    const pos = this.pos - this.hiddenOffset;
    return ((pos >= this.length) || (pos < 0));
  }

  /** return a String of the data */
  public readAll(): string {
    return this.readString(this.length, 0);
  }

}