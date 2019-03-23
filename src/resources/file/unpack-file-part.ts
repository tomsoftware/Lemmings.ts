module Lemmings {

	/** represents a part/chunk of a file and is  */
	export class UnpackFilePart {

		/** file offset in the container */
		public offset : number = 0;
		/** flag for uncompressing */
		public initialBufferLen: number  = 0;
		/** checksum this file need to have */
		public checksum: number  = 0;
		/** size the uncompressed chunk should have */
		public decompressedSize: number  = 0;
		/** the size the compressed chunk had */
		public compressedSize : number = 0;
		public unknown0: number  = 0;
		public unknown1: number  = 0;

		/** position of this part/chunk in the container */
		public index : number = 0;

		public fileReader : BinaryReader;

		/** is the unpacking done? */
		private unpackingDone : boolean;

		private error : LogHandler = new LogHandler("UnpackFilePart");

		constructor(fileReader : BinaryReader){
			this.fileReader = fileReader;
			this.unpackingDone = false;
		}


		/** unpack this content and return a BinaryReader */
		public unpack() : BinaryReader{

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
		private doUnpacking(fileReader : BinaryReader) {
			var bitReader = new BitReader(fileReader, this.offset, this.compressedSize, this.initialBufferLen);
			var outBuffer = new BitWriter(bitReader, this.decompressedSize);

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
				this.error.debug("doUnpacking("+ fileReader.filename  +") done! ");
			}
			else {
				this.error.log("doUnpacking("+ fileReader.filename  +") : Checksum mismatch! ");
			}

			/// create FileReader from buffer
			var outReader = outBuffer.getFileReader(fileReader.filename +"["+ this.index +"]");

			return outReader;
		}
	}

}