module Lemmings {
	
	/** Read the container file and return the unpacked parts of it  */
	export class FileContainer {

		private parts: UnpackFilePart[];
		private error : LogHandler = new LogHandler("FileContainer");

		/** read the content of the container  */
		constructor (content: BinaryReader) {
			this.read(content);
		}

		/** Unpack a part (chunks / segments) of the file and return it */
		public getPart(index : number) : BinaryReader {
			if ((index < 0) || (index >= this.parts.length)) {
				this.error.log("getPart("+ index +") Out of index!");
				return new BinaryReader();
			}
			return this.parts[index].unpack();	
		}

		/** return the number of parts in this file */
		public count() {
			return this.parts.length;
		}

		/** do the read job and find all parts in this container */
		private read(fileReader: BinaryReader) {
			/// reset parts
			this.parts = new Array<UnpackFilePart>();

			/// we start at the end of the file
			var pos = 0;
			
			/// the size of the header
			const HEADER_SIZE = 10;

			while(pos + HEADER_SIZE < fileReader.length) {

				fileReader.setOffset(pos);

        		let part = new UnpackFilePart(fileReader);
				
				/// start of the chunk
				part.offset = pos + HEADER_SIZE;

				/// Read Header of each Part
				part.initialBufferLen = fileReader.readByte();
				part.checksum = fileReader.readByte();

				part.unknown1 = fileReader.readWord();
				part.decompressedSize = fileReader.readWord();

				part.unknown0 = fileReader.readWord();
				var size = fileReader.readWord();

				part.compressedSize = size - HEADER_SIZE;
				
				/// position of this part in the container
				part.index = this.parts.length;

				/// check if the data are valid
				if ((part.offset < 0) || (size > 0xFFFFFF) || (size < 10)) {
					this.error.log("out of sync "+ fileReader.filename);
					break;
				}

				//- add part
				this.parts.push(part);

				//this.error.debug(part);

				/// jump to next part
				pos += size;
			}

			this.error.debug(fileReader.filename +" has "+ this.parts.length +" file-parts.")
		}
	}
}						
