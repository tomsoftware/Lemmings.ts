module Lemmings {

	/** The ColorPalette Class provides a Collor Palette of the game.
	 *  use:
	 *                           INDEX    RGBA
	 * read:  ColorPalette.data[0 ... 16].color;
	 * write: ColorPalette.setColor(INT index, INT r, INT g, INT b, BOOL locked)
	 */
	export class ColorPalette {

		private data = new Uint32Array(16); //- 16 colors

		constructor() {
			this.data.fill(0);
		}


		/** set color from Int-Value e.g. 0xFF00FF00 */
		public setColorInt(index: number, colorValue: number) {
			this.data[index] = colorValue;
		}

		/** return a int-color value e.g. 0xFF00FF00 */
		public getColor(index: number): number {
			return this.data[index];
		}

		/** set color from R,G,B */
		public setColorRGB(index: number, r: number, g: number, b: number) {

			this.setColorInt(index, ColorPalette.colorFromRGB(r, g, b));
		}

		public static colorFromRGB( r: number, g: number, b: number) : number {
			return 0xFF << 24 | b << 16 | g << 8 | r << 0;
		}

		public static get black() : number {
			return 0xFF000000;
		}

		public static get debugColor() : number {
			return 0xFFFF00FF;
		}

		/** set lemmings default colors */
		/*
		public defaultColors() {
			this.setColorRGB(0,   0,   0,   0);	// balck
			this.setColorRGB(1,  64,  64, 224);	// blue: Lemmings Body
			this.setColorRGB(2,   0, 176,   0);	// green: Lemmings haar
			this.setColorRGB(3, 243, 211, 211);	// white: Lemmings skin / Letters 
			this.setColorRGB(4, 178, 178,   0);	// yellow
			this.setColorRGB(5, 243,  32,  32);	// dark red
			this.setColorRGB(6, 130, 130, 130);	// gray
			this.setColorRGB(7, 224, 128,  32);	// this color is set by the level
		}
		*/
	}

}