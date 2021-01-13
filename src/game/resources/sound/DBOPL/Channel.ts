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

import { Chip } from './chip';
import { GlobalMembers } from './global-members';
import { Operator } from './operator';
import { Shifts, SynthMode } from './db-opl3';

/* 
* 2019 - Typescript Version: Thomas Zeugner
*/


export class Channel {

    private channels: Channel[];
    public ChannelIndex: number;

    private Channel(index: number): Channel {
        return this.channels[this.ChannelIndex + index];
    }

    private operators: Operator[];
    private thisOpIndex: number;

    public Op(index: number): Operator {
        return this.operators[this.thisOpIndex + index];
    }


    public synthMode: SynthMode;
    public chanData: number; /** int */
    public old: Int32Array = new Int32Array(2);

    public feedback: number; /** byte */
    public regB0: number; /** byte */
    public regC0: number; /** byte */

    public fourMask: number; /** byte */
    public maskLeft: number; /** char */
    public maskRight: number; /** char */


    public SetChanData(chip: Chip, data: number /** Bit32u */): void {
        const change = this.chanData ^ data;
        this.chanData = data;
        this.Op(0).chanData = data;
        this.Op(1).chanData = data;
        //Since a frequency update triggered this, always update frequency
        this.Op(0).UpdateFrequency();
        this.Op(1).UpdateFrequency();
        if ((change & (0xff << Shifts.SHIFT_KSLBASE)) != 0) {
            this.Op(0).UpdateAttenuation();
            this.Op(1).UpdateAttenuation();
        }
        if ((change & (0xff << Shifts.SHIFT_KEYCODE)) != 0) {
            this.Op(0).UpdateRates(chip);
            this.Op(1).UpdateRates(chip);
        }
    }

    public UpdateFrequency(chip: Chip, fourOp: number /** UInt8 */): void {
        //Extrace the frequency signed long
        let data = this.chanData & 0xffff;

        const kslBase = GlobalMembers.KslTable[data >>> 6];

        let keyCode = (data & 0x1c00) >>> 9;
        if ((chip.reg08 & 0x40) != 0) {

            keyCode |= (data & 0x100) >>> 8;	/* notesel == 1 */
        }
        else {

            keyCode |= (data & 0x200) >>> 9;/* notesel == 0 */
        }
        //Add the keycode and ksl into the highest signed long of chanData
        data |= (keyCode << Shifts.SHIFT_KEYCODE) | (kslBase << Shifts.SHIFT_KSLBASE);
        this.Channel(0).SetChanData(chip, data);
        if ((fourOp & 0x3f) != 0) {
            this.Channel(1).SetChanData(chip, data);
        }
    }

    public WriteA0(chip: Chip, val: number /* UInt8 */): void {
        const fourOp = (chip.reg104 & chip.opl3Active & this.fourMask);
        //Don't handle writes to silent fourop channels
        if (fourOp > 0x80) {
            return;
        }
        const change = (this.chanData ^ val) & 0xff;
        if (change != 0) {
            this.chanData ^= change;
            this.UpdateFrequency(chip, fourOp);
        }
    }

    public WriteB0(chip: Chip, val: number /* UInt8 */): void {
        const fourOp = (chip.reg104 & chip.opl3Active & this.fourMask);
        //Don't handle writes to silent fourop channels
        if (fourOp > 0x80) {
            return;
        }
        const change = ((this.chanData ^ (val << 8)) & 0x1f00);
        if (change != 0) {
            this.chanData ^= change;
            this.UpdateFrequency(chip, fourOp);
        }
        //Check for a change in the keyon/off state
        if (((val ^ this.regB0) & 0x20) == 0) {
            return;
        }
        this.regB0 = val;
        if ((val & 0x20) != 0) {
            this.Op(0).KeyOn(0x1);
            this.Op(1).KeyOn(0x1);
            if ((fourOp & 0x3f) != 0) {
                this.Channel(1).Op(0).KeyOn(1);
                this.Channel(1).Op(1).KeyOn(1);
            }
        }
        else {
            this.Op(0).KeyOff(0x1);
            this.Op(1).KeyOff(0x1);
            if ((fourOp & 0x3f) != 0) {
                this.Channel(1).Op(0).KeyOff(1);
                this.Channel(1).Op(1).KeyOff(1);
            }
        }
    }

    public WriteC0(chip: Chip, val: number /* UInt8 */): void {
        const change = (val ^ this.regC0);
        if (change == 0) {
            return;
        }
        this.regC0 = val;

        this.feedback = ((val >>> 1) & 7);
        if (this.feedback != 0) {
            //We shift the input to the right 10 bit wave index value
            this.feedback = (9 - this.feedback) & 0xFF;
        }
        else {
            this.feedback = 31;
        }
        //Select the new synth mode
        if (chip.opl3Active) {
            //4-op mode enabled for this channel
            if (((chip.reg104 & this.fourMask) & 0x3f) != 0) {
                let chan0: Channel;
                let chan1: Channel;
                //Check if it's the 2nd channel in a 4-op
                if ((this.fourMask & 0x80) == 0) {
                    chan0 = this.Channel(0);
                    chan1 = this.Channel(1);
                }
                else {
                    chan0 = this.Channel(- 1);
                    chan1 = this.Channel(0);
                }

                const synth = (((chan0.regC0 & 1) << 0) | ((chan1.regC0 & 1) << 1));
                switch (synth) {
                    case 0:
                        //chan0.synthHandler = this.BlockTemplate<SynthMode.sm3FMFM>;
                        chan0.synthMode = SynthMode.sm3FMFM;
                        break;
                    case 1:
                        //chan0.synthHandler = this.BlockTemplate<SynthMode.sm3AMFM>;
                        chan0.synthMode = SynthMode.sm3AMFM;
                        break;
                    case 2:
                        //chan0.synthHandler = this.BlockTemplate<SynthMode.sm3FMAM>;
                        chan0.synthMode = SynthMode.sm3FMAM;
                        break;
                    case 3:
                        //chan0.synthHandler = this.BlockTemplate<SynthMode.sm3AMAM>;
                        chan0.synthMode = SynthMode.sm3AMAM;
                        break;
                }
                //Disable updating percussion channels
            }
            else if ((this.fourMask & 0x40) && (chip.regBD & 0x20)) {

                //Regular dual op, am or fm
            }
            else if (val & 1) {
                //this.synthHandler = this.BlockTemplate<SynthMode.sm3AM>;
                this.synthMode = SynthMode.sm3AM;
            }
            else {
                //this.synthHandler = this.BlockTemplate<SynthMode.sm3FM>;
                this.synthMode = SynthMode.sm3FM;
            }
            this.maskLeft = (val & 0x10) != 0 ? -1 : 0;
            this.maskRight = (val & 0x20) != 0 ? -1 : 0;
            //opl2 active
        }
        else {
            //Disable updating percussion channels
            if ((this.fourMask & 0x40) != 0 && (chip.regBD & 0x20) != 0) {

                //Regular dual op, am or fm
            }
            else if (val & 1) {
                //this.synthHandler = this.BlockTemplate<SynthMode.sm2AM>;
                this.synthMode = SynthMode.sm2AM;
            }
            else {
                //this.synthHandler = this.BlockTemplate<SynthMode.sm2FM>;
                this.synthMode = SynthMode.sm2FM;
            }
        }
    }

    public ResetC0(chip: Chip): void {
        const val = this.regC0;
        this.regC0 ^= 0xff;
        this.WriteC0(chip, val);
    }


    // template< bool opl3Mode> void Channel::GeneratePercussion( Chip* chip, Bit32s* output ) {
    public GeneratePercussion(opl3Mode: boolean, chip: Chip, output: Int32Array /* Bit32s */, outputOffset: number): void {

        //BassDrum
        let mod = ((this.old[0] + this.old[1])) >>> this.feedback;
        this.old[0] = this.old[1];
        this.old[1] = this.Op(0).GetSample(mod);

        //When bassdrum is in AM mode first operator is ignoed
        if ((this.regC0 & 1) != 0) {
            mod = 0;
        }
        else {
            mod = this.old[0];
        }
        let sample = this.Op(1).GetSample(mod);


        //Precalculate stuff used by other outputs
        const noiseBit = chip.ForwardNoise() & 0x1;
        const c2 = this.Op(2).ForwardWave();
        const c5 = this.Op(5).ForwardWave();
        const phaseBit = (((c2 & 0x88) ^ ((c2 << 5) & 0x80)) | ((c5 ^ (c5 << 2)) & 0x20)) != 0 ? 0x02 : 0x00;

        //Hi-Hat
        const hhVol = this.Op(2).ForwardVolume();

        if (!((hhVol) >= ((12 * 256) >> (3 - ((9) - 9))))) {
            const hhIndex = (phaseBit << 8) | (0x34 << (phaseBit ^ (noiseBit << 1)));
            sample += this.Op(2).GetWave(hhIndex, hhVol);
        }
        //Snare Drum
        const sdVol = this.Op(3).ForwardVolume();

        if (!((sdVol) >= ((12 * 256) >> (3 - ((9) - 9))))) {
            const sdIndex = (0x100 + (c2 & 0x100)) ^ (noiseBit << 8);
            sample += this.Op(3).GetWave(sdIndex, sdVol);
        }
        //Tom-tom
        sample += this.Op(4).GetSample(0);

        //Top-Cymbal
        const tcVol = this.Op(5).ForwardVolume();

        if (!((tcVol) >= ((12 * 256) >> (3 - ((9) - 9))))) {
            const tcIndex = (1 + phaseBit) << 8;
            sample += this.Op(5).GetWave(tcIndex, tcVol);
        }
        sample <<= 1;
        if (opl3Mode) {
            output[outputOffset + 0] += sample;
            output[outputOffset + 1] += sample;
        }
        else {
            output[outputOffset + 0] += sample;
        }
    }


    /// template<SynthMode mode> Channel* Channel::BlockTemplate( Chip* chip, Bit32u samples, Bit32s* output ) 
    //public BlockTemplate(mode: SynthMode, chip: Chip, samples: number, output: Int32Array /** Bit32s* */): Channel {
    public synthHandler(chip: Chip, samples: number, output: Int32Array, outputIndex: number /** Bit32s* */): Channel | null {
        const mode = this.synthMode;
        switch (mode) {
            case SynthMode.sm2AM:
            case SynthMode.sm3AM:
                if (this.Op(0).Silent() && this.Op(1).Silent()) {
                    this.old[0] = this.old[1] = 0;
                    return this.Channel(1);
                }
                break;
            case SynthMode.sm2FM:
            case SynthMode.sm3FM:
                if (this.Op(1).Silent()) {
                    this.old[0] = this.old[1] = 0;
                    return this.Channel(1);
                }
                break;
            case SynthMode.sm3FMFM:
                if (this.Op(3).Silent()) {
                    this.old[0] = this.old[1] = 0;
                    return this.Channel(2);
                }
                break;
            case SynthMode.sm3AMFM:
                if (this.Op(0).Silent() && this.Op(3).Silent()) {
                    this.old[0] = this.old[1] = 0;
                    return this.Channel(2);
                }
                break;
            case SynthMode.sm3FMAM:
                if (this.Op(1).Silent() && this.Op(3).Silent()) {
                    this.old[0] = this.old[1] = 0;
                    return this.Channel(2);
                }
                break;
            case SynthMode.sm3AMAM:
                if (this.Op(0).Silent() && this.Op(2).Silent() && this.Op(3).Silent()) {
                    this.old[0] = this.old[1] = 0;
                    return this.Channel(2);
                }
                break;
        }

        //Init the operators with the the current vibrato and tremolo values
        this.Op(0).Prepare(chip);
        this.Op(1).Prepare(chip);
        if (mode > SynthMode.sm4Start) {
            this.Op(2).Prepare(chip);
            this.Op(3).Prepare(chip);
        }
        if (mode > SynthMode.sm6Start) {
            this.Op(4).Prepare(chip);
            this.Op(5).Prepare(chip);
        }
        for (let i = 0; i < samples; i++) {
            //Early out for percussion handlers
            if (mode == SynthMode.sm2Percussion) {
                this.GeneratePercussion(false, chip, output, outputIndex + i);
                continue;//Prevent some unitialized value bitching
            }
            else if (mode == SynthMode.sm3Percussion) {
                this.GeneratePercussion(true, chip, output, outputIndex + i * 2);
                continue;//Prevent some unitialized value bitching
            }


            //Do unsigned shift so we can shift out all signed long but still stay in 10 bit range otherwise
            const mod = ((this.old[0] + this.old[1])) >>> this.feedback;
            this.old[0] = this.old[1];
            this.old[1] = this.Op(0).GetSample(mod);
            let sample = 0;
            const out0 = this.old[0];
            if (mode == SynthMode.sm2AM || mode == SynthMode.sm3AM) {
                sample = out0 + this.Op(1).GetSample(0);
            }
            else if (mode == SynthMode.sm2FM || mode == SynthMode.sm3FM) {
                sample = this.Op(1).GetSample(out0);
            }
            else if (mode == SynthMode.sm3FMFM) {
                let next = this.Op(1).GetSample(out0);
                next = this.Op(2).GetSample(next);
                sample = this.Op(3).GetSample(next);
            }
            else if (mode == SynthMode.sm3AMFM) {
                sample = out0;
                let next = this.Op(1).GetSample(0);
                next = this.Op(2).GetSample(next);
                sample += this.Op(3).GetSample(next);
            }
            else if (mode == SynthMode.sm3FMAM) {
                sample = this.Op(1).GetSample(out0);
                const next = this.Op(2).GetSample(0);
                sample += this.Op(3).GetSample(next);
            }
            else if (mode == SynthMode.sm3AMAM) {
                sample = out0;
                const next = this.Op(1).GetSample(0);
                sample += this.Op(2).GetSample(next);
                sample += this.Op(3).GetSample(0);
            }
            switch (mode) {
                case SynthMode.sm2AM:
                case SynthMode.sm2FM:
                    output[outputIndex + i] += sample;
                    break;
                case SynthMode.sm3AM:
                case SynthMode.sm3FM:
                case SynthMode.sm3FMFM:
                case SynthMode.sm3AMFM:
                case SynthMode.sm3FMAM:
                case SynthMode.sm3AMAM:
                    output[outputIndex + i * 2 + 0] += sample & this.maskLeft;
                    output[outputIndex + i * 2 + 1] += sample & this.maskRight;
                    break;
            }
        }
        switch (mode) {
            case SynthMode.sm2AM:
            case SynthMode.sm2FM:
            case SynthMode.sm3AM:
            case SynthMode.sm3FM:
                return this.Channel(1);
            case SynthMode.sm3FMFM:
            case SynthMode.sm3AMFM:
            case SynthMode.sm3FMAM:
            case SynthMode.sm3AMAM:
                return this.Channel(2);
            case SynthMode.sm2Percussion:
            case SynthMode.sm3Percussion:
                return this.Channel(3);
        }
        return null;
    }

    public constructor(channels: Channel[], thisChannel: number, operators: Operator[], thisOpIndex: number) {

        this.channels = channels;
        this.ChannelIndex = thisChannel;
        this.operators = operators;
        this.thisOpIndex = thisOpIndex;

        this.old[0] = this.old[1] = 0 | 0;
        this.chanData = 0 | 0;
        this.regB0 = 0 | 0;
        this.regC0 = 0 | 0;
        this.maskLeft = -1 | 0;
        this.maskRight = -1 | 0;
        this.feedback = 31 | 0;
        this.fourMask = 0 | 0;
        this.synthMode = SynthMode.sm2FM;
    }
}

