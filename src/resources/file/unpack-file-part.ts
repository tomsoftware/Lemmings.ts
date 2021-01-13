import { LogHandler } from '@/game/utilities/log-handler';
import { BinaryReader } from './binary-reader';
import { BitReader } from './bit-reader';
import { BitWriter } from './bit-writer';

/** represents a part/chunk of a file and is  */
export class UnpackFilePart {

	/** file offset in the container */
	public offset = 0;
	/** flag for decompressing */
	public initialBufferLen = 0;
	/** checksum this file need to have */
	public checksum = 0;
	/** size the decompressed chunk should have */
	public decompressedSize = 0;
	/** the size the compressed chunk had */
	public compressedSize = 0;
	public unknown0 = 0;
	public unknown1 = 0;

	/** position of this part/chunk in the container */
	public index = 0;

	public fileReader: BinaryReader;

	/** is the unpacking done? */
	private unpackingDone: boolean;

	private log: LogHandler = new LogHandler('UnpackFilePart');

	constructor(fileReader: BinaryReader) {
		this.fileReader = fileReader;
		this.unpackingDone = false;
	}


	/** unpack this content and return a BinaryReader */
	public unpack(): BinaryReader {

		/// if the unpacking is not yet done, do it...
		if (!this.unpackingDone) {
			this.fileReader = this.doUnpacking(this.fileReader);
			this.unpackingDone = true;
			return this.fileReader;
		}

		/// use the cached file buffer but with a new file pointer
		return new BinaryReader(this.fileReader);

	}


	/// unpack the fileReader
	private doUnpacking(fileReader: BinaryReader) {
		const bitReader = new BitReader(fileReader, this.offset, this.compressedSize, this.initialBufferLen);
		const outBuffer = new BitWriter(bitReader, this.decompressedSize);

		while ((!outBuffer.eof()) && (!bitReader.eof())) {

			if (bitReader.read(1) == 0) {

				switch (bitReader.read(1)) {
					case 0:	// 00
						outBuffer.copyRawData(bitReader.read(3) + 1);
						break;
					case 1:	// 01
						outBuffer.copyReferencedData(2, 8);
						break;
				}
			}
			else {

				switch (bitReader.read(2)) {
					case 0:	// 100
						outBuffer.copyReferencedData(3, 9);
						break;
					case 1:	// 101
						outBuffer.copyReferencedData(4, 10);
						break;
					case 2:	// 110
						outBuffer.copyReferencedData(bitReader.read(8) + 1, 12);
						break;
					case 3:	// 111
						outBuffer.copyRawData(bitReader.read(8) + 9);
						break;
				}
			}

		}

		if (this.checksum == bitReader.getCurrentChecksum()) {
			this.log.debug('doUnpacking(' + fileReader.fileName + ') done! ');
		}
		else {
			this.log.log('doUnpacking(' + fileReader.fileName + ') : Checksum mismatch! ');
		}

		/// create FileReader from buffer
		return outBuffer.getFileReader(fileReader.fileName + '[' + this.index + ']');
	}
}
