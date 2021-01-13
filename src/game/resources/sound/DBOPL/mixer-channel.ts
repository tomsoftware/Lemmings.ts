/*
 *  Copyright (C) 2002-2015  The DOSBox Team
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 */

/* 
* 2019 - Typescript Version: Thomas Zeugner
*/



export class MixerChannel {

    public buffer: Int16Array;
    public channels: number;

    constructor(buffer: Int16Array, channels: number) {
        this.buffer = buffer;
        this.channels = channels;
    }

    private CLIP(v: number): number {
        const SAMPLE_SIZE = 2;
        const SAMP_BITS = (SAMPLE_SIZE << 3);
        const SAMP_MAX = ((1 << (SAMP_BITS - 1)) - 1);
        const SAMP_MIN = -((1 << (SAMP_BITS - 1)));

        return (((v) > SAMP_MAX) ? SAMP_MAX : (((v) < SAMP_MIN) ? SAMP_MIN : (v)))
    }

    public AddSamples_m32(samples: number, buffer: Int32Array) {
        // Volume amplication (0 == none, 1 == 2x, 2 == 4x)
        const VOL_AMP = 1;

        // Convert samples from mono int32 to stereo int16
        let out: Int16Array = this.buffer;
        let outIndex = 0;
        let ch = this.channels;

        if (ch == 2) {
            for (let i = 0; i < samples; i++) {
                let v = this.CLIP(buffer[i] << VOL_AMP);

                out[outIndex] = v;
                outIndex++;
                out[outIndex] = v;
                outIndex++;
            }
        }
        else {
            for (let i = 0; i < samples; i++) {
                let v = buffer[i] << VOL_AMP;

                out[outIndex] = this.CLIP(v);
                outIndex++;
            }
        }

        return;
    }


    public AddSamples_s32(samples: number, buffer: Int32Array) {
        // Volume amplication (0 == none, 1 == 2x, 2 == 4x)
        const VOL_AMP = 1;

        // Convert samples from stereo s32 to stereo s16
        let out: Int16Array = this.buffer;
        let outIndex = 0;
        let ch = this.channels;

        if (ch == 2) {
            for (let i = 0; i < samples; i++) {

                let v = buffer[i * 2] << VOL_AMP;
                out[outIndex] = this.CLIP(v);
                outIndex++;

                v = buffer[i * 2 + 1] << VOL_AMP;
                out[outIndex] = this.CLIP(v);
                outIndex++;
            }
        }
        else {
            for (let i = 0; i < samples; i++) {
                let v = buffer[i * 2] << VOL_AMP;
                out[outIndex] = this.CLIP(v);
                outIndex++;
            }
        }

        return;
    }
}

