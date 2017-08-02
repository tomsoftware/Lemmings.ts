module Lemmings {
  
  /** Class to provide a read pointer and readfunctions to a binary Buffer */
  export class BinaryReader {
    
    private _error : ErrorHandler = new ErrorHandler("BinaryReader");
    public filename:string;
    protected data : Uint8Array;
    protected hiddenOffset : number;
    public length : number;
    public pos : number;


    constructor(dataArray? : BinaryReader| Uint8Array | ArrayBuffer | Blob, offset: number = 0, length?: number, filename: string = "[unknown]") {

      this.filename = filename;

      let dataLenght = 0;

      if (dataArray == null) {
          this.data = new Uint8Array(0);
          dataLenght = 0;
          this._error.log("BinaryReader from NULL; size:"+ 0);

      } else if (dataArray instanceof BinaryReader) {
          //- if dataArray is BinaryReader use there data
          this.data = dataArray.data;
          dataLenght = dataArray.length;
          this._error.log("BinaryReader from BinaryReader; size:"+ dataLenght);

      } else if (dataArray instanceof Uint8Array){
          this.data = dataArray;
          dataLenght = dataArray.byteLength;
          this._error.log("BinaryReader from Uint8Array; size:"+ dataLenght);
          
      }
      else if (dataArray instanceof ArrayBuffer){
          this.data = new Uint8Array(dataArray);
          dataLenght = dataArray.byteLength;
          this._error.log("BinaryReader from ArrayBuffer; size:"+ dataLenght);
      }
      else if (dataArray instanceof Blob){
          this.data = new Uint8Array(<any>dataArray);
          dataLenght = this.data.byteLength;
          this._error.log("BinaryReader from Blob; size:"+ dataLenght);
      }      
      else {
          this.data = dataArray;
          dataLenght = this.data.length;
          this._error.log("BinaryReader from unknown: "+ dataArray + "; size:"+ dataLenght);
      }

      if (length == null) length = dataLenght - offset;

      this.hiddenOffset = offset;
      this.length = length;
      this.pos = this.hiddenOffset;

    }



    /** Read one Byte from stream */
    public readByte(offset ?: number) : number {
      if (offset != null) this.pos = (offset + this.hiddenOffset);

      if ((this.pos < 0) || (this.pos > this.data.length)) {
        this._error.log("read out of data: "+ this.filename +" - size: "+ this.data.length +" @ "+ this.pos);
        return 0;
      }

      let v: number = this.data[this.pos];
      this.pos++;

      return v;
    }


    /** Read one DWord (4 Byte) from stream (little ending) */
    public readInt(length : number = 4, offset?: number) : number {

      if (offset == null) offset = this.pos;

      if (length == 4) {
        let v : number = (this.data[offset] << 24) | (this.data[offset + 1] << 16) | (this.data[offset + 2] << 8) | (this.data[offset + 3]);
        this.pos = offset + 4;
        return v;
      }

      let v : number = 0;
      for (let i:number = length; i > 0; i--) {
        v = (v << 8) | this.data[offset];
        offset++;
      }

      this.pos = offset;

      return v;
    }

    /** Read one DWord (4 Byte) from stream (big ending) */
    public readIntBE(offset?: number) : number{

      if (offset == null) offset = this.pos;

      let v : number = (this.data[offset]) | (this.data[offset + 1] << 8) | (this.data[offset + 2] << 16) | (this.data[offset + 3] << 24);
      this.pos = offset + 4;

      return v;
    }


    /** Read one Word (2 Byte) from stream (big ending) */
    public readWord(offset?: number) : number {
      if (offset == null) offset = this.pos;

      let v : number = (this.data[offset] << 8) | (this.data[offset + 1]);
      this.pos = offset + 2;

      return v;
    }

    /** Read one Word (2 Byte) from stream (big ending) */
    public readWordBE(offset?: number) : number{
      if (offset == null) offset = this.pos;

      let v:number = (this.data[offset]) | (this.data[offset + 1] << 8);
      this.pos = offset + 2;

      return v;
    }


    /** Read a String */
    public readString(length:number, offset?:number):string {

      if (offset === null) this.pos = offset + this.hiddenOffset;
      let result = "";

      for (let i = 0; i < length; i++) {
        let v : number = this.data[this.pos];
        this.pos++;

        result += String.fromCharCode(v);
      }
      return result;

    }

    /** return the current curser position */
    public getOffset() : number {
      return this.pos - this.hiddenOffset;
    }

    /** set the current curser position */
    public setOffset(newPos : number) {
      this.pos = newPos + this.hiddenOffset;
    }

    /** return true if the curserposition is out of data */
    public eof() : boolean {
      let pos = this.pos - this.hiddenOffset;
      return ((pos >= this.length) || (pos < 0));
    }

    /** return a String of the data */
    public readAll() : string {
      return this.readString(this.length, 0);
    }

  }
}