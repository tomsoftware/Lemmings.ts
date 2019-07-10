namespace DBOPL {

    export class Handler {

        public chip:Chip = new Chip();
        
        public WriteAddr(port:number /* int*/, val:number /* byte */):number /** int */ {
            return this.chip.WriteAddr(port, val);
        }

        public WriteReg(addr:number /** int */, val:number /** byte */):void {
            this.chip.WriteReg(addr, val);
        }

        public Generate(chan:MixerChannel, samples:number /** short */):void {
            let buffer = new Int32Array(512 * 2);
            if ((samples > 512)) {
                samples = 512;
            }
            if (!this.chip.opl3Active) {
                this.chip.GenerateBlock2(samples, buffer);
               
                chan.AddSamples_m32(samples, buffer);
            }
            else {
                this.chip.GenerateBlock3(samples, buffer);
         
                chan.AddSamples_s32(samples, buffer);
            }
        }

        public Init(rate:number /** short */):void {
            GlobalMembers.InitTables();
            this.chip.Setup(rate);
        }
    }

}