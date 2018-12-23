module Lemmings {

	/** The ColorPalette Class provides a Collor Palette of the game.
	 *  use:
	 *                           INDEX   RGBA
	 * read:  ColorPalette.data[0 ... 16][0..3];
	 * write: ColorPalette.setColor(INT index, INT r, INT g, INT b, BOOL locked)
	 */
	export class ColorPalette {

		public data = new Array(16); //- 16 colors
		private isColorLock = new Int8Array(16);


		constructor() {
			for(let i=0; i< this.data.length; i++) {
				this.setColorInt(i, 0);
			}
		}


		//- locked colors are only changed if locked==true
		public setColorInt(index: number, colorValue:number, locked:boolean=false) {

			let r = (colorValue >>> 16) & 0xFF;
			let g = (colorValue >>> 8 ) & 0xFF;
			let b = (colorValue	      ) & 0xFF;
			
			this.setColorRGB(index, r, g, b, locked);
		}

		public getColor(index: number) {
			return this.data[index];
		}

		//- locked colors are only changed if locked==true
		public setColorRGB(index: number, r: number, g: number, b: number, locked:boolean=false)	{
			var color = new Uint8Array(4);

			//- if the color is locked we do not overwrite it.
			if ((this.isColorLock[index] != 0) && (!locked)) return;

			color[0] = r;
			color[1] = g;
			color[2] = b;
			color[3] = 255;

			this.data[index] = color;
			this.isColorLock[index] = locked?1:0;
		}


		/** init with locked colors that can't be changed */
		public initLockedValues() {
			this.setColorInt(0, 0x000000, true);	// balck
			this.setColorInt(1, 0x4040e0, true);	// blue: Lemmings Body
			this.setColorInt(2, 0x00b000, true);	// green: Lemmings haar
			this.setColorInt(3, 0xf3d3d3, true);	// white: Lemmings skin / Letters 
			this.setColorInt(4, 0xb2b200, true);	// yellow
			this.setColorInt(5, 0xf32020, true);	// dark red
			this.setColorInt(6, 0x828282, true);	// gray
			this.setColorInt(7, 0xe08020);			// this color is set by the level
		}
	}

}