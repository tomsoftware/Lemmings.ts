namespace DBOPL {


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

            // Convert samples from mono s32 to stereo s16
            let out: Int16Array = this.buffer;
            let outIndex = 0;
            let ch = this.channels;

            let debug = "";

            for (let i = 0; i < samples; i++) {
                debug += buffer[i] +">";

                let v = buffer[i] << VOL_AMP;
                out[outIndex] = this.CLIP(v);
                debug += out[outIndex] +"|";
                outIndex++;
                if (ch == 2) {
                    out[outIndex] = this.CLIP(v);
                    outIndex++;
                }
            }

            //console.log(debug);
            return;
        }

        public AddSamples_s32(samples: number, buffer: Int32Array) {
            // Volume amplication (0 == none, 1 == 2x, 2 == 4x)
            const VOL_AMP = 1;

            // Convert samples from stereo s32 to stereo s16
            let out: Int16Array = this.buffer;
            let outIndex = 0;
            let ch = this.channels;

            for (let i = 0; i < samples; i++) {
                let v = buffer[i * 2] << VOL_AMP;
                out[outIndex] = this.CLIP(v);
                outIndex++;
                if (ch == 2) {
                    v = buffer[i * 2 + 1] << VOL_AMP;
                    out[outIndex] = this.CLIP(v);
                    outIndex++;
                }
            }
            return;
        }
    }

}