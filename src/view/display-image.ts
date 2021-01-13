import { DrawProperties } from '../resources/draw-properties';
import { Frame } from '../resources/frame';
import { Mask } from '../resources/mask';
import { SolidLayer } from '../resources/solid-layer';
import { EventHandler } from '../utilities/event-handler';
import { Position2D } from '../utilities/position2d';
import { Rectangle } from '../utilities/rectangle';
import { Stage } from './stage';

/** handel the display of the game images */
export class DisplayImage {

    private imgData?: ImageData;
    private groundMask?: SolidLayer;


    public getWidth(): number {
        if (!this.imgData) {
            return 0;
        }
        return this.imgData.width;
    }
    public getHeight(): number {
        if (!this.imgData) {
            return 0;
        }
        return this.imgData.height;
    }

    constructor(private stage: Stage) {
        this.onMouseDown.on((e) => {
            if (!e) {
                return;
            }

            this.setDebugPixel(e.x, e.y);
        });
    }

    public onMouseUp = new EventHandler<Position2D>();
    public onMouseDown = new EventHandler<Position2D>();
    public onMouseMove = new EventHandler<Position2D>();
    public onDoubleClick = new EventHandler<Position2D>();

    public initSize(width: number, height: number) {
        /// create image data
        if ((this.imgData) && (this.imgData.width == width) && (this.imgData.height == height)) {
            return;
        }

        const tmpImg = this.stage.createImage(this, width, height);

        if (!tmpImg) {
            return;
        }

        this.imgData = tmpImg;

        this.clear();
    }

    public clear() {
        if (!this.imgData) {
            return;
        }

        const img = new Uint32Array(this.imgData.data);

        for (let i = 0; i < img.length; i++) {
            img[i] = 0xFF00FF00;
        }
    }


    /** render the level-background to an image */
    public setBackground(groundImage: Uint8ClampedArray, groundMask?: SolidLayer) {
        if (!this.imgData) {
            return;
        }

        /// set pixels
        this.imgData.data.set(groundImage);
        this.groundMask = groundMask;
    }


    private uint8ClampedColor(colorValue: number): number {
        return colorValue & 0xFF;
    }

    public drawRectangle(rect: Rectangle, red: number, green: number, blue: number) {
        this.drawHorizontalLine(rect.x1, rect.y1, rect.x2, red, green, blue);
        this.drawHorizontalLine(rect.x1, rect.y2, rect.x2, red, green, blue);
        this.drawVerticalLine(rect.x1, rect.y1, rect.y2, red, green, blue);
        this.drawVerticalLine(rect.x2, rect.y1, rect.y2, red, green, blue);
    }

    /** draw a rect to the display */
    public drawRect(x: number, y: number, width: number, height: number, red: number, green: number, blue: number) {

        const x2 = x + width;
        const y2 = y + height;

        this.drawHorizontalLine(x, y, x2, red, green, blue);
        this.drawHorizontalLine(x, y2, x2, red, green, blue);
        this.drawVerticalLine(x, y, y2, red, green, blue);
        this.drawVerticalLine(x2, y, y2, red, green, blue);

    }

    public drawVerticalLine(x1: number, y1: number, y2: number, red: number, green: number, blue: number) {
        if (!this.imgData) {
            return;
        }

        red = this.uint8ClampedColor(red);
        green = this.uint8ClampedColor(green);
        blue = this.uint8ClampedColor(blue);

        const destW = this.imgData.width;
        const destH = this.imgData.height;
        const destData = this.imgData.data;

        x1 = (x1 >= destW) ? (destW - 1) : (x1 < 0) ? 0 : x1;
        y1 = (y1 >= destH) ? (destH - 1) : (y1 < 0) ? 0 : y1;
        y2 = (y2 >= destH) ? (destH - 1) : (y2 < 0) ? 0 : y2;

        for (let y = y1; y <= y2; y += 1) {
            const destIndex = ((destW * y) + x1) * 4;

            destData[destIndex] = red;
            destData[destIndex + 1] = green;
            destData[destIndex + 2] = blue;
            destData[destIndex + 3] = 255;
        }
    }


    public drawHorizontalLine(x1: number, y1: number, x2: number, red: number, green: number, blue: number) {
        if (!this.imgData) {
            return;
        }

        red = this.uint8ClampedColor(red);
        green = this.uint8ClampedColor(green);
        blue = this.uint8ClampedColor(blue);

        const destW = this.imgData.width;
        const destH = this.imgData.height;
        const destData = this.imgData.data;

        x1 = (x1 >= destW) ? (destW - 1) : (x1 < 0) ? 0 : x1;
        y1 = (y1 >= destH) ? (destH - 1) : (y1 < 0) ? 0 : y1;
        x2 = (x2 >= destW) ? (destW - 1) : (x2 < 0) ? 0 : x2;

        for (let x = x1; x <= x2; x += 1) {
            const destIndex = ((destW * y1) + x) * 4;

            destData[destIndex] = red;
            destData[destIndex + 1] = green;
            destData[destIndex + 2] = blue;
            destData[destIndex + 3] = 255;
        }
    }


    /** copy a mask frame to the display */
    public drawMask(mask: Mask, posX: number, posY: number) {
        if (!this.imgData) {
            return;
        }

        const srcW = mask.width;
        const srcH = mask.height;
        const srcMask = mask.getMask();

        const destW = this.imgData.width;
        const destH = this.imgData.height;
        const destData = new Uint32Array(this.imgData.data.buffer);

        const destX = posX + mask.offsetX;
        const destY = posY + mask.offsetY;

        for (let y = 0; y < srcH; y++) {

            const outY = y + destY;
            if ((outY < 0) || (outY >= destH)) {
                continue;
            }

            for (let x = 0; x < srcW; x++) {
                const srcIndex = ((srcW * y) + x);

                /// ignore transparent pixels
                if (srcMask[srcIndex] == 0) {
                    continue;
                }

                const outX = x + destX;
                if ((outX < 0) || (outX >= destW)) {
                    continue;
                }

                const destIndex = ((destW * outY) + outX);

                destData[destIndex] = 0xFFFFFFFF;
            }
        }
    }

    /** copy a frame to the display - transparent color is changed to (r,g,b) */
    public drawFrameCovered(frame: Frame, posX: number, posY: number, red: number, green: number, blue: number) {
        if (!this.imgData) {
            return;
        }

        const srcW = frame.width;
        const srcH = frame.height;
        const srcBuffer = frame.getBuffer();
        const srcMask = frame.getMask();

        const nullColor = 0xFF << 24 | blue << 16 | green << 8 | red;

        const destW = this.imgData.width;
        const destH = this.imgData.height;
        const destData = new Uint32Array(this.imgData.data.buffer);

        const destX = posX + frame.offsetX;
        const destY = posY + frame.offsetY;

        red = this.uint8ClampedColor(red);
        green = this.uint8ClampedColor(green);
        blue = this.uint8ClampedColor(blue);

        for (let y = 0; y < srcH; y++) {

            const outY = y + destY;
            if ((outY < 0) || (outY >= destH)) {
                continue;
            }

            for (let x = 0; x < srcW; x++) {
                const srcIndex = ((srcW * y) + x);

                const outX = x + destX;
                if ((outX < 0) || (outX >= destW)) {
                    continue;
                }

                const destIndex = ((destW * outY) + outX);

                if (srcMask[srcIndex] == 0) {
                    /// transparent pixel
                    destData[destIndex] = nullColor;
                }
                else {
                    destData[destIndex] = srcBuffer[srcIndex];
                }
            }
        }
    }


    /** copy a frame to the display */
    public drawFrame(frame: Frame, posX: number, posY: number) {
        if (!this.imgData) {
            return;
        }

        const srcW = frame.width;
        const srcH = frame.height;
        const srcBuffer = frame.getBuffer();
        const srcMask = frame.getMask();

        const destW = this.imgData.width;
        const destH = this.imgData.height;
        const destData = new Uint32Array(this.imgData.data.buffer);

        const destX = posX + frame.offsetX;
        const destY = posY + frame.offsetY;

        for (let y = 0; y < srcH; y++) {

            const outY = y + destY;
            if ((outY < 0) || (outY >= destH)) {
                continue;
            }

            for (let x = 0; x < srcW; x++) {
                const srcIndex = ((srcW * y) + x);

                /// ignore transparent pixels
                if (srcMask[srcIndex] == 0) {
                    continue;
                }

                const outX = x + destX;
                if ((outX < 0) || (outX >= destW)) {
                    continue;
                }

                const destIndex = ((destW * outY) + outX);

                destData[destIndex] = srcBuffer[srcIndex];
            }
        }
    }


    /** copy a frame to the display */
    public drawFrameFlags(frame: Frame, posX: number, posY: number, destConfig: DrawProperties) {
        if (!this.imgData) {
            return;
        }

        const srcW = frame.width;
        const srcH = frame.height;
        const srcBuffer = frame.getBuffer();
        const srcMask = frame.getMask();

        const destW = this.imgData.width;
        const destH = this.imgData.height;
        const destData = new Uint32Array(this.imgData.data.buffer);

        const destX = posX + frame.offsetX;
        const destY = posY + frame.offsetY;

        const upsideDown = destConfig.isUpsideDown;
        const noOverwrite = destConfig.noOverwrite;
        const onlyOverwrite = destConfig.onlyOverwrite;

        const mask = this.groundMask;

        for (let srcY = 0; srcY < srcH; srcY++) {

            const outY = srcY + destY;
            if ((outY < 0) || (outY >= destH)) {
                continue;
            }

            for (let srcX = 0; srcX < srcW; srcX++) {

                const sourceY = upsideDown ? (srcH - srcY - 1) : srcY;
                const srcIndex = ((srcW * sourceY) + srcX);

                /// ignore transparent pixels
                if (srcMask[srcIndex] == 0) {
                    continue;
                }

                const outX = srcX + destX;
                if ((outX < 0) || (outX >= destW)) {
                    continue;
                }

                /// check flags
                if (noOverwrite && mask) {
                    if (mask.hasGroundAt(outX, outY)) {
                        continue;
                    }
                }

                if (onlyOverwrite && mask) {
                    if (!mask.hasGroundAt(outX, outY)) {
                        continue;
                    }
                }

                /// draw
                const destIndex = ((destW * outY) + outX);

                destData[destIndex] = srcBuffer[srcIndex];
            }
        }

    }

    public setDebugPixel(x: number, y: number) {
        if (!this.imgData) {
            return;
        }

        const pointIndex = (this.imgData.width * (y) + x) * 4;

        this.imgData.data[pointIndex] = 255;
        this.imgData.data[pointIndex + 1] = 0;
        this.imgData.data[pointIndex + 2] = 0;
    }


    public setPixel(x: number, y: number, r: number, g: number, b: number) {
        if (!this.imgData) {
            return;
        }

        const pointIndex = (this.imgData.width * (y) + x) * 4;

        this.imgData.data[pointIndex] = r;
        this.imgData.data[pointIndex + 1] = g;
        this.imgData.data[pointIndex + 2] = b;
    }


    public setScreenPosition(x: number, y: number) {
        this.stage.setGameViewPointPosition(x, y);
    }

    public getImageData() {
        return this.imgData;
    }

    public redraw() {
        this.stage.redraw();
    }
}
