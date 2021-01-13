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

import { Chip } from './chip';
import { GlobalMembers } from './global-members';
import { Shifts } from './db-opl3';


enum Operator20Masks {
    MASK_KSR = 0x10,
    MASK_SUSTAIN = 0x20,
    MASK_VIBRATO = 0x40,
    MASK_TREMOLO = 0x80

}

enum State {
    OFF,
    RELEASE,
    SUSTAIN,
    DECAY,
    ATTACK,
}

export class Operator {

    public waveBase = 0; /** Int16  */
    public waveMask = 0; /** UInt32 */
    public waveStart = 0; /** UInt32 */

    public waveIndex = 0; /** UInt32 */ // WAVE_signed long shifted counter of the frequency index
    public waveAdd = 0; /** UInt32 */ //The base frequency without vibrato
    public waveCurrent = 0; /** UInt32 */  //waveAdd + vibratao

    public chanData = 0; /** UInt32 */ //Frequency/octave and derived data coming from whatever channel controls this
    public freqMul = 0; /** UInt32 */ //Scale channel frequency with this, TODO maybe remove?
    public vibrato = 0; /** UInt32 */ //Scaled up vibrato strength
    public sustainLevel = 0; /** Int32 */ //When stopping at sustain level stop here
    public totalLevel = 0; /** Int32 */ //totalLevel is added to every generated volume
    public currentLevel = 0; /** UInt32 */ //totalLevel + tremolo
    public volume = 0; /** Int32 */ //The currently active volume

    public attackAdd = 0; /** UInt32 */ //Timers for the different states of the envelope
    public decayAdd = 0; /** UInt32 */
    public releaseAdd = 0; /** UInt32  */
    public rateIndex = 0; /** UInt32 */ //Current position of the evenlope

    public rateZero: number; /** Int8 */ 	//signed long for the different states of the envelope having no changes
    public keyOn: number; /** Int8 */ //Bitmask of different values that can generate keyon

    //Registers, also used to check for changes
    public reg20: number; /** Int8 */
    public reg40: number; /** Int8 */
    public reg60: number; /** Int8 */
    public reg80: number; /** Int8 */
    public regE0: number; /** Int8 */

    //Active part of the envelope we're in
    public state = 0; /** Int8 */
    //0xff when tremolo is enabled
    public tremoloMask = 0; /** Int8 */
    //Strength of the vibrato
    public vibStrength = 0; /** Int8 */
    //Keep track of the calculated KSR so we can check for changes
    public ksr: number; /** Int8 */


    private SetState(s: State /** Int8 */): void {
        this.state = s;
    }

    //We zero out when rate == 0
    private UpdateAttack(chip: Chip): void {
        const rate = this.reg60 >>> 4; /** UInt8 */
        if (rate != 0) {
            const val = ((rate << 2) + this.ksr) | 0; /** UInt8 */
            this.attackAdd = chip.attackRates[val];
            this.rateZero &= ~(1 << State.ATTACK);
        }
        else {
            this.attackAdd = 0;
            this.rateZero |= (1 << State.ATTACK);
        }
    }

    private UpdateRelease(chip: Chip): void {
        const rate = (this.reg80 & 0xf);
        if (rate != 0) {
            const val = ((rate << 2) + this.ksr) | 0;
            this.releaseAdd = chip.linearRates[val];
            this.rateZero &= ~(1 << State.RELEASE);
            if ((this.reg20 & Operator20Masks.MASK_SUSTAIN) == 0) {
                this.rateZero &= ~(1 << State.SUSTAIN);
            }
        }
        else {
            this.rateZero |= (1 << State.RELEASE);
            this.releaseAdd = 0;
            if ((this.reg20 & Operator20Masks.MASK_SUSTAIN) == 0) {
                this.rateZero |= (1 << State.SUSTAIN);
            }
        }
    }

    private UpdateDecay(chip: Chip): void {
        const rate = (this.reg60 & 0xf);
        if (rate != 0) {
            const val = ((rate << 2) + this.ksr) | 0;
            this.decayAdd = chip.linearRates[val];
            this.rateZero &= ~(1 << State.DECAY);
        }
        else {
            this.decayAdd = 0;
            this.rateZero |= (1 << State.DECAY);
        }
    }

    public UpdateAttenuation(): void {
        const kslBase = ((this.chanData >>> Shifts.SHIFT_KSLBASE) & 0xff);
        const tl = this.reg40 & 0x3f;

        const kslShift = GlobalMembers.KslShiftTable[this.reg40 >>> 6];
        //Make sure the attenuation goes to the right Int32
        this.totalLevel = tl << ((9) - 7);
        this.totalLevel += (kslBase << ((9) - 9)) >> kslShift;
    }

    public UpdateRates(chip: Chip): void {
        //Mame seems to reverse this where enabling ksr actually lowers
        //the rate, but pdf manuals says otherwise?

        let newKsr = ((this.chanData >>> Shifts.SHIFT_KEYCODE) & 0xff);
        if ((this.reg20 & Operator20Masks.MASK_KSR) == 0) {
            newKsr >>>= 2;
        }
        if (this.ksr == newKsr) {
            return;
        }
        this.ksr = newKsr;
        this.UpdateAttack(chip);
        this.UpdateDecay(chip);
        this.UpdateRelease(chip);
    }

    public UpdateFrequency(): void {
        const freq = this.chanData & ((1 << 10) - 1) | 0;
        const block = (this.chanData >>> 10) & 0xff;


        this.waveAdd = ((freq << block) * this.freqMul) | 0;

        if ((this.reg20 & Operator20Masks.MASK_VIBRATO) != 0) {

            this.vibStrength = (freq >>> 7) & 0xFF;

            this.vibrato = ((this.vibStrength << block) * this.freqMul) | 0;

        }
        else {
            this.vibStrength = 0;
            this.vibrato = 0;
        }
    }

    public Write20(chip: Chip, val: number /** Int8 */): void {
        const change = (this.reg20 ^ val);
        if (change == 0) {
            return;
        }
        this.reg20 = val;
        //Shift the tremolo bit over the entire register, saved a branch, YES!
        this.tremoloMask = ((val) >> 7) & 0xFF;
        this.tremoloMask &= ~((1 << ((9) - 9)) - 1);
        //Update specific features based on changes
        if ((change & Operator20Masks.MASK_KSR) != 0) {
            this.UpdateRates(chip);
        }
        //With sustain enable the volume doesn't change
        if ((this.reg20 & Operator20Masks.MASK_SUSTAIN) != 0 || (this.releaseAdd == 0)) {
            this.rateZero |= (1 << State.SUSTAIN);
        }
        else {
            this.rateZero &= ~(1 << State.SUSTAIN);
        }
        //Frequency multiplier or vibrato changed
        if ((change & (0xf | Operator20Masks.MASK_VIBRATO)) != 0) {
            this.freqMul = chip.freqMul[val & 0xf];
            this.UpdateFrequency();
        }
    }

    public Write40(chip: Chip, val: number /** Int8 */): void {
        if ((this.reg40 ^ val) == 0) {
            return;
        }
        this.reg40 = val;
        this.UpdateAttenuation();
    }

    public Write60(chip: Chip, val: number /** Int8 */): void {
        const change = (this.reg60 ^ val);
        this.reg60 = val;
        if ((change & 0x0f) != 0) {
            this.UpdateDecay(chip);
        }
        if ((change & 0xf0) != 0) {
            this.UpdateAttack(chip);
        }
    }

    public Write80(chip: Chip, val: number /** Int8 */): void {
        const change = (this.reg80 ^ val);
        if (change == 0) {
            return;
        }
        this.reg80 = val;

        let sustain = (val >>> 4);
        //Turn 0xf into 0x1f
        sustain |= (sustain + 1) & 0x10;
        this.sustainLevel = sustain << ((9) - 5);
        if ((change & 0x0f) != 0) {
            this.UpdateRelease(chip);
        }
    }

    public WriteE0(chip: Chip, val: number /** Int8 */): void {
        if ((this.regE0 ^ val) == 0) {
            return;
        }
        //in opl3 mode you can always selet 7 waveforms regardless of waveformselect
        const waveForm = (val & ((0x3 & chip.waveFormMask) | (0x7 & chip.opl3Active)));
        this.regE0 = val;



        //this.waveBase = GlobalMembers.WaveTable + GlobalMembers.WaveBaseTable[waveForm];
        this.waveBase = GlobalMembers.WaveBaseTable[waveForm];
        this.waveStart = (GlobalMembers.WaveStartTable[waveForm] << (32 - 10)) >>> 0;
        this.waveMask = GlobalMembers.WaveMaskTable[waveForm];

    }


    public Silent(): boolean {

        if (!((this.totalLevel + this.volume) >= ((12 * 256) >> (3 - ((9) - 9))))) {
            return false;
        }
        if ((this.rateZero & (1 << this.state)) == 0) {
            return false;
        }
        return true;
    }

    public Prepare(chip: Chip) {
        this.currentLevel = this.totalLevel + (chip.tremoloValue & this.tremoloMask);
        this.waveCurrent = this.waveAdd;

        if ((this.vibStrength >>> chip.vibratoShift) != 0) {

            let add = this.vibrato >>> chip.vibratoShift;
            //Sign extend over the shift value
            const neg = chip.vibratoSign;
            //Negate the add with -1 or 0
            add = ((add ^ neg) - neg);
            this.waveCurrent += add;
        }
    }

    public KeyOn(mask: number /** Int8 */) {
        if (this.keyOn == 0) {
            //Restart the frequency generator

            this.waveIndex = this.waveStart;

            this.rateIndex = 0;
            this.SetState(State.ATTACK);
        }
        this.keyOn |= mask;
    }

    public KeyOff(mask: number /** Int8 */) {
        this.keyOn &= ~mask;
        if (this.keyOn == 0) {
            if (this.state != State.OFF) {
                this.SetState(State.RELEASE);
            }
        }
    }


    // public TemplateVolume(yes:State):number {
    public TemplateVolume(): number {
        const yes = this.state;
        let vol = this.volume;
        let change: number;

        switch (yes) {
            case State.OFF:
                return (511 << ((9) - 9));
            case State.ATTACK:
                change = this.RateForward(this.attackAdd);
                if (change == 0) {
                    return vol;
                }

                vol += ((~vol) * change) >> 3;
                if (vol < 0) {
                    this.volume = 0;
                    this.rateIndex = 0;
                    this.SetState(State.DECAY);
                    return 0;
                }
                break;
            case State.DECAY:
                vol += this.RateForward(this.decayAdd);
                if ((vol >= this.sustainLevel)) {
                    //Check if we didn't overshoot max attenuation, then just go off
                    if ((vol >= (511 << ((9) - 9)))) {
                        this.volume = (511 << ((9) - 9));
                        this.SetState(State.OFF);
                        return (511 << ((9) - 9));
                    }
                    //Continue as sustain
                    this.rateIndex = 0;
                    this.SetState(State.SUSTAIN);
                }
                break;
            case State.SUSTAIN:
                if ((this.reg20 & Operator20Masks.MASK_SUSTAIN) != 0) {
                    return vol;
                }
                // falls through : In sustain phase, but not sustaining, do regular release
                
            case State.RELEASE:
                vol += this.RateForward(this.releaseAdd);
                if ((vol >= (511 << ((9) - 9)))) {
                    this.volume = (511 << ((9) - 9));
                    this.SetState(State.OFF);
                    return (511 << ((9) - 9));
                }
                break;
        }
        this.volume = vol;
        return vol | 0;
    }

    public RateForward(add: number /* UInt32 */): number /** Int32 */ {
        this.rateIndex += add | 0;

        const ret = this.rateIndex >>> 24;
        this.rateIndex = this.rateIndex & ((1 << 24) - 1);
        return ret;
    }

    public ForwardWave(): number /* unsigned long  */ {
        this.waveIndex = (this.waveIndex + this.waveCurrent) >>> 0;
        return (this.waveIndex >>> (32 - 10));
    }

    public ForwardVolume(): number /** 	unsigned long */ {
        return this.currentLevel + this.TemplateVolume();
    }

    public GetSample(modulation: number /** Int32 */): number /** Int32  */ {
        //this.printDebug();
        const vol = this.ForwardVolume();

        if (((vol) >= ((12 * 256) >> (3 - ((9) - 9))))) {
            //Simply forward the wave
            this.waveIndex = (this.waveIndex + this.waveCurrent) >>> 0;
            return 0;
        }
        else {
            let index = this.ForwardWave();
            index += modulation;
            return this.GetWave(index, vol);
        }
    }


    public GetWave(index: number /** Uint32 */, vol: number /** Uint32 */): number /** Int32 */ {
        return ((GlobalMembers.WaveTable[this.waveBase + (index & this.waveMask)] * GlobalMembers.MulTable[vol >>> ((9) - 9)]) >> 16);
    }

    public constructor() {
        this.chanData = 0 | 0;
        this.freqMul = 0 | 0;
        this.waveIndex = 0 >>> 0;
        this.waveAdd = 0 | 0;
        this.waveCurrent = 0 | 0;
        this.keyOn = 0 | 0;
        this.ksr = 0 | 0;
        this.reg20 = 0 | 0;
        this.reg40 = 0 | 0;
        this.reg60 = 0 | 0;
        this.reg80 = 0 | 0;
        this.regE0 = 0 | 0;
        this.SetState(State.OFF);
        this.rateZero = (1 << State.OFF);
        this.sustainLevel = (511 << ((9) - 9));
        this.currentLevel = (511 << ((9) - 9));
        this.totalLevel = (511 << ((9) - 9));
        this.volume = (511 << ((9) - 9));
        this.releaseAdd = 0;
    }
}


