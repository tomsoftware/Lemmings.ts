import { DisplayImage } from './display-image';
import { ViewPoint } from './view-point';

export class StageImageProperties {
    public ctx: CanvasRenderingContext2D | null = null;
    public cav?: HTMLCanvasElement;
    /** X position to display this Image */
    public x = 0;
    /** Y position to display this Image */
    public y = 0;

    public width = 0;
    public height = 0;

    public display: DisplayImage | null = null;
    public viewPoint: ViewPoint;

    constructor(zoom: number) {
        this.viewPoint = new ViewPoint(0, 0, zoom);
    }

    public createImage(width: number, height: number) {
        this.cav = document.createElement('canvas');

        this.cav.width = width;
        this.cav.height = height;

        this.ctx = this.cav.getContext('2d');
        if (!this.ctx) {
            return null;
        }

        return this.ctx.createImageData(width, height);
    }
}

