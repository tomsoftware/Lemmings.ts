/// <reference path="opl3.ts"/>
/// <reference path="./../adlib-player.ts"/>


module Lemmings {
    export class AudioPlayer  {

        private error = new ErrorHandler("AudioPlayer");

        public context:AudioContext;
        public source:AudioBufferSourceNode;
        public processor:ScriptProcessorNode;
        public gain:GainNode;

        private opl : OPL3;
        
        private srcOplPlayer :AdlibPlayer;

        private queue:  Float32Array[] = []; //Float32Array[] = [];


        private silence;

        private PCM_FRAME_SIZE = 64 * 4;
        private FRAMES_IN_OUTBUFFER = 32;

        /** is the sound playing at the moment */
        private isPlaying : boolean = false;


        constructor(src: AdlibPlayer) {
            this.opl = new OPL3();
            this.srcOplPlayer = src;

            /// setup audio context
            this.context = new AudioContext();

            this.source = this.context.createBufferSource();
            this.processor = this.context.createScriptProcessor(this.FRAMES_IN_OUTBUFFER * this.PCM_FRAME_SIZE, 0, 2);
            this.gain = this.context.createGain();

            
            this.silence = new Float32Array(this.PCM_FRAME_SIZE);

            this.gain.gain.value = 1;
        }


        /** fill the cache with data */
        private readAdlib() {

            if (!this.isPlaying) return;

            var startTime = window.performance.now();

            /// fill the buffer with 100 PCM blocks
            while (this.queue.length < 300){

                /// read on music-bar from source file
                this.srcOplPlayer.read((reg:number, value: number) => {

                    /// write Adlib-Commands
                    this.opl.write(0, reg, value);
                });

                /// Render the adlib commands to PCM Sound
                ///  => to get the right speed we need to sampel about (64 * 6) to (64 * 8) values for Lemmings
                this.queue.push(this.opl.readMonoLemmings(this.PCM_FRAME_SIZE));
                this.queue.push(this.opl.readMonoLemmings(this.PCM_FRAME_SIZE));
            }

            this.error.debug("Elapsed Time for sampling opl "+ (window.performance.now() - startTime));

            /// periodically process new data 
            window.setTimeout(() => {
                this.readAdlib();
            }, 100);

        }

        /** Start playback of the song/sound */
        public play() {
            
            this.isPlaying = true;

            /// read and buffer PCM block
            this.readAdlib();

            /// setup Web-Audio
            this.processor.onaudioprocess = (e: AudioProcessingEvent) => this.audioScriptProcessor(e);
            this.source.connect(this.processor);
            this.processor.connect(this.gain);
            this.gain.connect(this.context.destination);

            /// delay the playback
            window.setTimeout(() => {
                /// only start if not stopped so fare
                if ((this.source) && (this.isPlaying)) {
                    this.source.start();
                }
            }, 500);
        }


        /** stop playing and close */
        public stop() {
 
            if (this.isPlaying) {
                this.isPlaying = false;

                try{
                    this.source.stop();
                } catch (ex) {}
            }

            try {
                this.context.close();
            } catch (ex) {}

            if (this.processor) {
                this.processor.onaudioprocess = null;
            }

            try {
                this.source.disconnect(this.processor);
                this.processor.disconnect(this.gain);
                this.gain.disconnect(this.context.destination);
            } catch (ex) {}
            
   
            this.context = null;
            this.source = null;
            this.processor = null;
            this.gain = null;

            this.opl  = null;
            this.srcOplPlayer = null;          
            
        }


        
        public audioScriptProcessor(e: AudioProcessingEvent){

            //this.error.log("queue.length: "+ this.queue.length);

            if (!this.isPlaying) return;

            let outputBuffer = e.outputBuffer;
            let offset = 0;

            for (let i=0; i < this.FRAMES_IN_OUTBUFFER; i++ ){

                var pcmFrame = null;

                if (this.queue.length > 0) {

                    /// read from FiFo buffer
                    pcmFrame = this.queue.shift();
                }

                /// use silence on error
                if (!pcmFrame) {
                    /// no data ->
                    pcmFrame = this.silence;

                    this.error.log("Out of Data!");
                    return;
                }

                /// copy PCM bloack to out buffer
                outputBuffer.copyToChannel(pcmFrame, 0, offset); /// left
                outputBuffer.copyToChannel(pcmFrame, 1, offset); /// right

                offset += pcmFrame.length;
            }
        }

    }
}