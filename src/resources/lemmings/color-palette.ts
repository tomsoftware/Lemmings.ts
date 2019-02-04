module Lemmings {

	/** The ColorPalette Class provides a Collor Palette of the game.
	 *  use:
	 *                           INDEX   RGBA
	 * read:  ColorPalette.data[0 ... 16][0..3];
	 * write: ColorPalette.setColor(INT index, INT r, INT g, INT b, BOOL locked)
	 */
	export class ColorPalette {

		public data = new Array(16); //- 16 colors

		constructor() {
			for(let i=0; i< this.data.length; i++) {
				this.setColorInt(i, 0);
			}
		}


		//- locked colors are only changed if locked==true
		public setColorInt(index: number, colorValue:number) {

			let r = (colorValue >>> 16) & 0xFF;
			let g = (colorValue >>> 8 ) & 0xFF;
			let b = (colorValue	      ) & 0xFF;
			
			this.setColorRGB(index, r, g, b);
		}

		public getColor(index: number) {
			return this.data[index];
		}

		//- locked colors are only changed if locked==true
		public setColorRGB(index: number, r: number, g: number, b: number)	{
			var color = new Uint8Array(4);

			color[0] = r;
			color[1] = g;
			color[2] = b;
			color[3] = 255;

			this.data[index] = color;
		}


		/** init with locked colors that can't be changed */
		public initLockedValues() {
			this.setColorInt(0, 0x000000);	// balck
			this.setColorInt(1, 0x4040e0);	// blue: Lemmings Body
			this.setColorInt(2, 0x00b000);	// green: Lemmings haar
			this.setColorInt(3, 0xf3d3d3);	// white: Lemmings skin / Letters 
			this.setColorInt(4, 0xb2b200);	// yellow
			this.setColorInt(5, 0xf32020);	// dark red
			this.setColorInt(6, 0x828282);	// gray
			this.setColorInt(7, 0xe08020);	// this color is set by the level
		}
	}

}