import { BaseImageInfo } from './base-image-info';
import { ColorPalette } from './color-palette';

    /** stores terrain/background image properties */
    export class TerrainImageInfo extends BaseImageInfo {
        constructor(palette: ColorPalette) {
            super(palette);
        }

    }

