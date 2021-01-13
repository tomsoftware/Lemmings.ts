
/** The ColorPalette Class provides a Color Palette of the game.
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

	public getR(index: number): number {
		return this.data[index] & 0xFF;
	}

	public getG(index: number): number {
		return (this.data[index] >> 8) & 0xFF;
	}

	public getB(index: number): number {
		return (this.data[index] >> 16) & 0xFF;
	}

	/** set color from R,G,B */
	public setColorRGB(index: number, r: number, g: number, b: number) {

		this.setColorInt(index, ColorPalette.colorFromRGB(r, g, b));
	}

	public static colorFromRGB(r: number, g: number, b: number): number {
		return 0xFF << 24 | b << 16 | g << 8 | r << 0;
	}

	public static get transparent(): number {
		return 0x00000000;
	}

	public static get black(): number {
		return 0xFF000000;
	}

	public static get debugColor(): number {
		return 0xFFFF00FF;
	}

	/** set default main colors */
	public setMainColors() {
		this.setColorRGB(0, 0, 0, 0); // black
		this.setColorRGB(1, 128, 64, 32); // browns
		this.setColorRGB(2, 96, 48, 32);
		this.setColorRGB(3, 48, 0, 16);
		this.setColorRGB(4, 32, 8, 124); // purples
		this.setColorRGB(5, 64, 44, 144);
		this.setColorRGB(6, 104, 88, 164);
		this.setColorRGB(7, 152, 140, 188);
		this.setColorRGB(8, 0, 80, 0); // greens
		this.setColorRGB(9, 0, 96, 16);
		this.setColorRGB(10, 0, 112, 32);
		this.setColorRGB(11, 0, 128, 64);
		this.setColorRGB(12, 208, 208, 208); // white
		this.setColorRGB(13, 176, 176, 0); // yellow
		this.setColorRGB(14, 64, 80, 176); // blue
		this.setColorRGB(15, 224, 128, 144);  // pink
	}
}
