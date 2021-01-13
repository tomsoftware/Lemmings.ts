import { LogHandler } from '@/game/utilities/log-handler';
import { BinaryReader } from './binary-reader';
import { BitReader } from './bit-reader';

/** Bit Stream Writer class */
export class BitWriter {

	private outData: Uint8Array;
	private outPos: number;
	private bitReader: BitReader;
	private log: LogHandler = new LogHandler("BitWriter");

	constructor(bitReader: BitReader, outLength: number) {
		this.outData = new Uint8Array(outLength);
		this.outPos = outLength;
		this.bitReader = bitReader;
	}

	/** copy length bytes from the reader */
	public copyRawData(length: number) {
		if (this.outPos - length < 0) {
			this.log.log("copyRawData: out of out buffer");
			length = this.outPos;
			return;
		}

		for (; length > 0; length--) {
			this.outPos--;
			this.outData[this.outPos] = this.bitReader.read(8);
		}
	}

	/** Copy length bits from the write cache */
	public copyReferencedData(length: number, offsetBitCount: number) {

		/// read offset to current write pointer to read from
		let offset = this.bitReader.read(offsetBitCount) + 1;

		/// is offset in range?
		if (this.outPos + offset > this.outData.length) {
			this.log.log("copyReferencedData: offset out of range");
			offset = 0;
			return;
		}

		/// is length in range
		if (this.outPos - length < 0) {
			this.log.log("copyReferencedData: out of out buffer");
			length = this.outPos;
			return;
		}

		for (; length > 0; length--) {
			this.outPos--;
			this.outData[this.outPos] = this.outData[this.outPos + offset];
		}
	}

	/** return a  BinaryReader with the data written to this BitWriter class */
	public getFileReader(filename: string): BinaryReader {
		return new BinaryReader(this.outData, null, null, filename);
	}

	public eof(): boolean {
		return this.outPos <= 0;
	}

}
