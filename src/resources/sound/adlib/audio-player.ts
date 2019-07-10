/// <reference path="./../sound-image-player.ts"/>

module Lemmings {
    export class AudioPlayer {

        private log = new LogHandler("AudioPlayer");

        public audioCtx: AudioContext;
        public source: AudioBufferSourceNode;
        public processor: ScriptProcessorNode;

        private opl: DBOPL.OPL;

        private soundImagePlayer: SoundImagePlayer;

        private samplesPerTick: number;


        /** is the sound playing at the moment */
        private isPlaying: boolean = false;


        constructor(src: SoundImagePlayer) {
            /// setup audio context
            this.audioCtx = new AudioContext();
            if (!this.audioCtx) {
                this.log.debug('Uanbel to create AudioContext!');
                return;
            }

            this.soundImagePlayer = src;

            this.log.debug("debug: " + this.soundImagePlayer.sampleRateFactor.toString(16));

            this.log.debug("Sound image sample rate factor: "+ this.soundImagePlayer.sampleRateFactor + " --> "+ this.soundImagePlayer.getSamplingInterval());
            this.log.debug('Audio sample rate ' + this.audioCtx.sampleRate);

            this.samplesPerTick = Math.round(this.audioCtx.sampleRate / (this.soundImagePlayer.getSamplingInterval()));
            this.source = this.audioCtx.createBufferSource();
            this.processor = this.audioCtx.createScriptProcessor(8192, 2, 2);

            // When the buffer source stops playing, disconnect everything
            this.source.onended = () => {
                console.log('source.onended()');
                this.source.disconnect(this.processor);
                this.processor.disconnect(this.audioCtx.destination);
                this.processor = null;
                this.source = null;
            }

   

            /// create opl interpreter
            this.opl = new DBOPL.OPL(this.audioCtx.sampleRate, 2);
     


            //this.gain = this.audioCtx.createGain();


            //this.silence = new Float32Array(this.PCM_FRAME_SIZE);

            //this.gain.gain.value = 1;
        }


        /** fill the cache with data */
        /*
        private readAdlib() {

            if (!this.isPlaying) return;

            var startTime = window.performance.now();

            /// fill the buffer with 100 PCM blocks
            while (this.queue.length < 384) {

                /// read on music-state from source file
                this.srcOplPlayer.read((reg: number, value: number) => {

                    /// write Adlib-Commands
                    this.opl.write(reg, value);
                });

                ///  Render the adlib commands to PCM Sound
                ///  => to get the right speed we need to sampel about (64 * 6) to (64 * 8) values for Lemmings
                const samples = this.opl.generate(this.PCM_FRAME_SIZE);
                const samplesLen = samples.length;

                /// convert int to float
                var trans = new Float32Array(samplesLen);

                for (let i = 0; i < samplesLen; i++) {
                    trans[i] = samples[i * 2] / 32768.0;
        
                }

                this.queue.push(trans);
            }

            //this.error.debug("Elapsed Time for sampling opl "+ (window.performance.now() - startTime));

            /// periodically process new data 
            window.setTimeout(() => {
                this.readAdlib();
            }, 100);

        }
*/
        /** Start playback of the song/sound */
        public play() {

            /// setup Web-Audio
            this.processor.onaudioprocess = (e: AudioProcessingEvent) => this.audioScriptProcessor(e);
            this.processor.connect(this.audioCtx.destination);
            this.source.connect(this.processor);
            this.source.start();
            this.audioCtx.resume();

            this.isPlaying = true;
        }


        private lenGen: number = 0;
        public audioScriptProcessor(e: AudioProcessingEvent) {

            var b = e.outputBuffer;

            var c0 = b.getChannelData(0);
            var c1 = b.getChannelData(1);

            let lenFill = b.length;
            let posFill = 0;

            while (posFill < lenFill) {
                // Fill any leftover delay from the last buffer-fill event first
                while (this.lenGen > 0) {
                    if (lenFill - posFill < 2) {
                        // No more space in buffer
                        return;
                    }
                    let lenNow = Math.max(2, Math.min(512, this.lenGen, lenFill - posFill));

                    const samples = this.opl.generate(lenNow);

                    //const samples = new Int16Array(s);
                    for (let i = 0; i < lenNow; i++) {
                        c0[posFill] = samples[i * 2 + 0] / 32768.0;
                        c1[posFill] = samples[i * 2 + 1] / 32768.0;
                        posFill++;
                    }
                    this.lenGen -= lenNow;
                }


                /// read on music-state from source file
                this.soundImagePlayer.read((reg: number, value: number) => {

                    /// write Adlib-Commands
                    this.opl.write(reg, value);
                });


                //document.getElementById('progress').firstChild.nodeValue = Math.round(p / imf.length * 100) + '%';
                this.lenGen += 1 * this.samplesPerTick;
            }
        }


        /** stop playing and close */
        public stop() {

            if (this.isPlaying) {
                this.isPlaying = false;
            }

            try {
                this.audioCtx.close();
            } catch (ex) { }

            if (this.processor) {
                this.processor.onaudioprocess = null;
            }

            try {
                this.source.disconnect(this.processor);
                // this.processor.disconnect(this.gain);
                //this.gain.disconnect(this.audioCtx.destination);
            } catch (ex) { }


            this.audioCtx = null;
            this.source = null;
            this.processor = null;
            //this.gain = null;

            this.opl = null;
            this.soundImagePlayer = null;

        }

    }
}