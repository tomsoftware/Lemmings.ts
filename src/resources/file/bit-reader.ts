import { BinaryReader } from './binary-reader';

/* reads the bits on a BinaryReader */
export class BitReader {

  private binReader: BinaryReader;
  private buffer: number;
  private bufferLen: number;
  private checksum: number;
  private pos = 0;

  constructor(fileReader: BinaryReader, offset: number, length: number, initBufferLength: number) {
    //- create a copy of the reader
    this.binReader = new BinaryReader(fileReader, offset, length, fileReader.fileName);

    this.pos = length;

    this.pos--;
    this.buffer = this.binReader.readByte(this.pos);

    this.bufferLen = initBufferLength;
    this.checksum = this.buffer;
  }


  /** return the checksum of the data have been read */
  public getCurrentChecksum(): number {
    return this.checksum;
  }


  /** read and return [bitCount] bits from the stream */
  public read(bitCount: number): number {

    let result = 0;

    for (let i = bitCount; i > 0; i--) {

      if (this.bufferLen <= 0) {
        this.pos--;

        const b = this.binReader.readByte(this.pos);

        this.buffer = b;
        this.checksum ^= b;
        this.bufferLen = 8;
      }

      this.bufferLen--;

      result = (result << 1) | (this.buffer & 1);
      this.buffer >>= 1;
    }

    return result;
  }

  /** end of data? */
  public eof(): boolean {
    return ((this.bufferLen <= 0) && (this.pos < 0))
  }
}
