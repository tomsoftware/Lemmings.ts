"use strict"
/*
 * File: OPL3.java
 * Software implementation of the Yamaha YMF262 sound generator.
 * Copyright (C) 2008 Robson Cozendey <robson@cozendey.com>
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 * 
 * One of the objectives of this emulator is to stimulate further research in the
 * OPL3 chip emulation. There was an explicit effort in making no optimizations, 
 * and making the code as legible as possible, so that a new programmer 
 * interested in modify and improve upon it could do so more easily. 
 * This emulator's main body of information was taken from reverse engineering of 
 * the OPL3 chip, from the YMF262 Datasheet and from the OPL3 section in the 
 * YMF278b Application's Manual,
 * together with the vibrato table information, eighth waveform parameter 
 * information and feedback averaging information provided in MAME's YMF262 and	
 * YM3812 emulators, by Jarek Burczynski and Tatsuyuki Satoh.
 * This emulator has a high degree of accuracy, and most of music files sound 
 * almost identical, exception made in some games which uses specific parts of 
 * the rhythm section. In this respect, some parts of the rhythm mode are still 
 * only an approximation of the real chip.
 * The other thing to note is that this emulator was done through recordings of 
 * the SB16 DAC, so it has not bitwise precision. Additional equipment should be 
 * used to verify the samples directly from the chip, and allow this exact 
 * per-sample correspondence. As a good side-effect, since this emulator uses 
 * floating point and has a more fine-grained envelope generator, it can produce 
 * sometimes a crystal-clear, denser kind of OPL3 sound that, because of that, 
 * may be useful for creating new music. 
 * 
 * Version 1.0.6
 * 
 * 
 * 2017 - Typescript Version: Thomas Zeugner
 */
module Lemmings {

 export class OPL3 {
    public registers = new Int32Array(0x200);

    protected operators: Operator[][];
    private channels2op = [[], []];
    private channels4op = [[], []];
    public channels:Channel[][];
    protected disabledChannel: DisabledChannel;
    

    protected bassDrumChannel: BassDrumChannel;
    protected highHatSnareDrumChannel: HighHatSnareDrumChannel;
    protected tomTomTopCymbalChannel: TomTomTopCymbalChannel;

    
    public highHatOperator:HighHatOperator;
    public snareDrumOperator:SnareDrumOperator;
    public tomTomOperator:TomTomOperator;
    public topCymbalOperator:TopCymbalOperator;
    protected highHatOperatorInNonRhythmMode:Operator;
    protected snareDrumOperatorInNonRhythmMode:Operator;
    protected tomTomOperatorInNonRhythmMode:Operator;
    protected topCymbalOperatorInNonRhythmMode:Operator;


    public nts:number = 0;
    public dam:number = 0;
    public dvb:number = 0;
    public ryt:number = 0;
    public bd:number = 0;
    public sd:number = 0;
    public tom:number = 0;
    public tc:number = 0;
    public hh:number = 0;
    public _new:number = 0;
    public connectionsel:number;

    public vibratoIndex:number=0;
    public tremoloIndex:number=0;
    
    /** The methods read() and write() are the only 
    // ones needed by the user to interface with the emulator.
    // read() returns one frame at a time, to be played at 49700 Hz, 
    // with each frame being four 16-bit samples,
    // corresponding to the OPL3 four output channels CHA...CHD. */
    //
    // - Changes: output only 2 Channels
    public read(bufferSize:number) : Float32Array[]{

        let output = [new Float32Array(bufferSize), new Float32Array(bufferSize)];

        let outputBuffer = new Float32Array(2);
        let channelOutput: Float32Array;

        for(let i=0; i< bufferSize; i++){

            for(let outputChannelNumber=0; outputChannelNumber<2; outputChannelNumber++) 
                outputBuffer[outputChannelNumber] = 0;

            // If _new = 0, use OPL2 mode with 9 channels. If _new = 1, use OPL3 18 channels;
            for(let array=0; array < (this._new + 1); array++) {
                for(let channelNumber=0; channelNumber < 9; channelNumber++) {
                    // Reads output from each OPL3 channel, and accumulates it in the output buffer:
                    channelOutput = this.channels[array][channelNumber].getChannelOutput();
                    for(let outputChannelNumber=0; outputChannelNumber<2; outputChannelNumber++)
                        outputBuffer[outputChannelNumber] += channelOutput[outputChannelNumber];
                }
            }
            
            // Normalizes the output buffer after all channels have been added,
            // with a maximum of 18 channels,
            // and multiplies it to get the 16 bit signed output.
            // -> convert to float
            for(let outputChannelNumber=0; outputChannelNumber<2; outputChannelNumber++) {
                output[outputChannelNumber][i]  = (outputBuffer[outputChannelNumber] / 18 * 0x7FFF) / 32768;
            }
            // Advances the OPL3-wide vibrato index, which is used by 
            // PhaseGenerator.getPhase() in each Operator.
            this.vibratoIndex++;
            if(this.vibratoIndex >= OPL3Data.vibratoTable[this.dvb].length) this.vibratoIndex = 0;
            // Advances the OPL3-wide tremolo index, which is used by 
            // EnvelopeGenerator.getEnvelope() in each Operator.
            this.tremoloIndex++;
            if(this.tremoloIndex >= OPL3Data.tremoloTable[this.dam].length) this.tremoloIndex = 0;   

        }

        return output;
    }
    
    /** optimised JavaScript Version of Read */
    public readMonoLemmings(bufferSize:number) : Float32Array{

        let output = new Float32Array(bufferSize);

      


        for(let i=0; i < bufferSize; i++){

            // Reads output from each OPL3 channel, and accumulates it in the output buffer:
            let outputValue0  =this.channels[0][0].getChannelOutput()[0];
            outputValue0 +=this.channels[0][1].getChannelOutput()[0];
            outputValue0 +=this.channels[0][2].getChannelOutput()[0];
            outputValue0 +=this.channels[0][3].getChannelOutput()[0];
            outputValue0 +=this.channels[0][4].getChannelOutput()[0];
            outputValue0 +=this.channels[0][5].getChannelOutput()[0];
            outputValue0 +=this.channels[0][6].getChannelOutput()[0];
            outputValue0 +=this.channels[0][7].getChannelOutput()[0];
            outputValue0 +=this.channels[0][8].getChannelOutput()[0];

            
            // Normalizes the output buffer after all channels have been added,
            // with a maximum of 18 channels,
            // and multiplies it to get the 16 bit signed output.

            output[i] = outputValue0 * 0.05555386013;


            // Advances the OPL3-wide vibrato index, which is used by 
            // PhaseGenerator.getPhase() in each Operator.
            this.vibratoIndex++;
            if(this.vibratoIndex >= OPL3Data.vibratoTable[this.dvb].length) this.vibratoIndex = 0;
            // Advances the OPL3-wide tremolo index, which is used by 
            // EnvelopeGenerator.getEnvelope() in each Operator.
            this.tremoloIndex++;
            if(this.tremoloIndex >= OPL3Data.tremoloTable[this.dam].length) this.tremoloIndex = 0;   

        }

        return output;
    }



    public write(array:number, address:number, data:number) {
        // The OPL3 has two registers arrays, each with adresses ranging
        // from 0x00 to 0xF5.
        // This emulator uses one array, with the two original register arrays
        // starting at 0x00 and at 0x100.
        let registerAddress = (array << 8) | address;        
        // If the address is out of the OPL3 memory map, returns.
        if(registerAddress < 0 || registerAddress >= 0x200) return;

        this.registers[registerAddress] = data;

        switch(address & 0xE0) {
            // The first 3 bits masking gives the type of the register by using its base address:
            // 0x00, 0x20, 0x40, 0x60, 0x80, 0xA0, 0xC0, 0xE0 
            // When it is needed, we further separate the register type inside each base address,
            // which is the case of 0x00 and 0xA0.
            
            // Through out this emulator we will use the same name convention to
            // reference a byte with several bit registers.
            // The name of each bit register will be followed by the number of bits
            // it occupies inside the byte. 
            // Numbers without accompanying names are unused bits.
            case 0x00:
                // Unique registers for the entire OPL3:                
               if(array==1) {
                    if(address==0x04) 
                        this.update_2_CONNECTIONSEL6();
                    else if(address==0x05) 
                        this.update_7_NEW1();
                }
                else if(address==0x08) this.update_1_NTS1_6();
                break;
                
            case 0xA0:
                // 0xBD is a control register for the entire OPL3:
                if(address==0xBD) {
                    if(array==0) 
                        this.update_DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1();
                    break;
                }
                // Registers for each channel are in A0-A8, B0-B8, C0-C8, in both register arrays.
                // 0xB0...0xB8 keeps kon,block,fnum(h) for each channel.
                if( (address & 0xF0) == 0xB0 && address <= 0xB8) {
                    // If the address is in the second register array, adds 9 to the channel number.
                    // The channel number is given by the last four bits, like in A0,...,A8.
                    this.channels[array][address & 0x0F].update_2_KON1_BLOCK3_FNUMH2();
                    break;                    
                }
                // 0xA0...0xA8 keeps fnum(l) for each channel.
                if( (address & 0xF0) == 0xA0 && address <= 0xA8)
                    this.channels[array][address & 0x0F].update_FNUML8();
                break;                    
            // 0xC0...0xC8 keeps cha,chb,chc,chd,fb,cnt for each channel:
            case 0xC0:
                if(address <= 0xC8)
                    this.channels[array][address & 0x0F].update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1();
                break;
                
            // Registers for each of the 36 Operators:
            default:
                let operatorOffset:number = address & 0x1F;
                if(this.operators[array][operatorOffset] == null) break;
                switch(address & 0xE0) {
                    // 0x20...0x35 keeps am,vib,egt,ksr,mult for each operator:                
                    case 0x20:
                        this.operators[array][operatorOffset].update_AM1_VIB1_EGT1_KSR1_MULT4();
                        break;
                    // 0x40...0x55 keeps ksl,tl for each operator: 
                    case 0x40:
                        this.operators[array][operatorOffset].update_KSL2_TL6();
                        break;
                    // 0x60...0x75 keeps ar,dr for each operator: 
                    case 0x60:
                        this.operators[array][operatorOffset].update_AR4_DR4();
                        break;
                    // 0x80...0x95 keeps sl,rr for each operator:
                    case 0x80:
                        this.operators[array][operatorOffset].update_SL4_RR4();
                        break;
                    // 0xE0...0xF5 keeps ws for each operator:
                    case 0xE0:     
                        this.operators[array][operatorOffset].update_5_WS3();
                }
        }
    }

    constructor() {        
    
        this.channels = [new Array(9), new Array(9)];

        this.initOperators();
        this.initChannels2op();
        this.initChannels4op();
        this.initRhythmChannels();
        this.initChannels();
    }
    
    private initOperators() {
        let baseAddress:number = 0;

        // The YMF262 has 36 operators:
        this.operators = [[], []]; //new Operator[2][0x20];
    
        for(let array=0; array<2; array++)
            for(let group = 0; group<=0x10; group+=8)
                for(let offset=0; offset<6; offset++) {
                    baseAddress = (array<<8) | (group+offset);
                    this.operators[array][group+offset] = new Operator(this, baseAddress);
                }
        
        // Create specific operators to switch when in rhythm mode:
        this.highHatOperator = new HighHatOperator(this);
        this.snareDrumOperator = new SnareDrumOperator(this);
        this.tomTomOperator = new TomTomOperator(this);
        this.topCymbalOperator = new TopCymbalOperator(this);
    
        // Save operators when they are in non-rhythm mode:
        // Channel 7:
        this.highHatOperatorInNonRhythmMode = this.operators[0][0x11];
        this.snareDrumOperatorInNonRhythmMode = this.operators[0][0x14];
        // Channel 8:
        this.tomTomOperatorInNonRhythmMode = this.operators[0][0x12];
        this.topCymbalOperatorInNonRhythmMode = this.operators[0][0x15];
        
    }
    
    private initChannels2op() {
        // The YMF262 has 18 2-op channels.
        // Each 2-op channel can be at a serial or parallel operator configuration:
        this.channels2op = [[], []]; //new Channel2op[2][9];
        
        for(let array=0; array<2; array++)
            for(let channelNumber=0; channelNumber<3; channelNumber++) {
                let baseAddress:number = (array<<8) | channelNumber;
                // Channels 1, 2, 3 -> Operator offsets 0x0,0x3; 0x1,0x4; 0x2,0x5
                this.channels2op[array][channelNumber]   = new Channel2op(this, baseAddress, this.operators[array][channelNumber], this.operators[array][channelNumber+0x3]);
                // Channels 4, 5, 6 -> Operator offsets 0x8,0xB; 0x9,0xC; 0xA,0xD
                this.channels2op[array][channelNumber+3] = new Channel2op(this, baseAddress+3, this.operators[array][channelNumber+0x8], this.operators[array][channelNumber+0xB]);
                // Channels 7, 8, 9 -> Operators 0x10,0x13; 0x11,0x14; 0x12,0x15
                this.channels2op[array][channelNumber+6] = new Channel2op(this, baseAddress+6, this.operators[array][channelNumber+0x10], this.operators[array][channelNumber+0x13]);
            }   
    }
    
    private initChannels4op() {
        // The YMF262 has 3 4-op channels in each array:
        this.channels4op = [[], []]; //new Channel4op[2][3];

        for(let array=0; array<2; array++)
            for(let channelNumber=0; channelNumber<3; channelNumber++) {
                let baseAddress = (array<<8) | channelNumber;
                // Channels 1, 2, 3 -> Operators 0x0,0x3,0x8,0xB; 0x1,0x4,0x9,0xC; 0x2,0x5,0xA,0xD;
                this.channels4op[array][channelNumber]   = new Channel4op(this, baseAddress, this.operators[array][channelNumber], this.operators[array][channelNumber+0x3], this.operators[array][channelNumber+0x8], this.operators[array][channelNumber+0xB]);
            }   
    }

    private initRhythmChannels() {
        this.bassDrumChannel = new BassDrumChannel(this);
        this.highHatSnareDrumChannel = new HighHatSnareDrumChannel(this);
        this.tomTomTopCymbalChannel = new TomTomTopCymbalChannel(this);
    }
    
    private initChannels() {
        // Channel is an abstract class that can be a 2-op, 4-op, rhythm or disabled channel, 
        // depending on the OPL3 configuration at the time.
        // channels[] inits as a 2-op serial channel array:
        for(let array=0; array<2; array++)
            for(let i=0; i<9; i++) this.channels[array][i] = this.channels2op[array][i];
        
        // Unique instance to fill future gaps in the Channel array,
        // when there will be switches between 2op and 4op mode.
        this.disabledChannel = new DisabledChannel(this);
    }

    private update_1_NTS1_6() {
        let _1_nts1_6 = this.registers[OPL3Data._1_NTS1_6_Offset];
        // Note Selection. This register is used in Channel.updateOperators() implementations,
        // to calculate the channel´s Key Scale Number.
        // The value of the actual envelope rate follows the value of
        // OPL3.nts,Operator.keyScaleNumber and Operator.ksr
        this.nts = (_1_nts1_6 & 0x40) >> 6;
    }
    
    private update_DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1() {
        let dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 = this.registers[OPL3Data.DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1_Offset];
        // Depth of amplitude. This register is used in EnvelopeGenerator.getEnvelope();
        this.dam = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x80) >> 7;
        
        // Depth of vibrato. This register is used in PhaseGenerator.getPhase();
        this.dvb = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x40) >> 6;
        
        let new_ryt = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x20) >> 5;
        if(new_ryt != this.ryt) {
            this.ryt = new_ryt;
            this.setRhythmMode();               
        }
        
        let new_bd  = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x10) >> 4;
        if(new_bd != this.bd) {
            this.bd = new_bd;
            if(this.bd==1) {
                this.bassDrumChannel.op1.keyOn();
                this.bassDrumChannel.op2.keyOn();
            }
        }
        
        let new_sd  = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x08) >> 3;
        if(new_sd != this.sd) {
            this.sd = new_sd;
            if(this.sd==1) this.snareDrumOperator.keyOn();
        }
        
        let new_tom = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x04) >> 2;
        if(new_tom != this.tom) {
            this.tom = new_tom;
            if(this.tom==1) this.tomTomOperator.keyOn();
        }
        
        let new_tc  = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x02) >> 1;
        if(new_tc != this.tc) {
            this.tc = new_tc;
            if(this.tc==1) this.topCymbalOperator.keyOn();
        }
        
        let new_hh  = dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x01;
        if(new_hh != this.hh) {
            this.hh = new_hh;
            if(this.hh==1) this.highHatOperator.keyOn();
        }
        
    }

    private update_7_NEW1() {
        let _7_new1 = this.registers[OPL3Data._7_NEW1_Offset];
        // OPL2/OPL3 mode selection. This register is used in 
        // OPL3.read(), OPL3.write() and Operator.getOperatorOutput();
        this._new = (_7_new1 & 0x01);
        if(this._new==1) this.setEnabledChannels();
        this.set4opConnections();                    
    }

    private setEnabledChannels() {
        for(let array=0; array<2; array++)
            for(let i=0; i<9; i++) {
                let baseAddress = this.channels[array][i].channelBaseAddress;
                this.registers[baseAddress+ChannelData.CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset] |= 0xF0;
                this.channels[array][i].update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1();
            }        
    }
    
    private update_2_CONNECTIONSEL6() {
        // This method is called only if _new is set.
        let _2_connectionsel6 = this.registers[OPL3Data._2_CONNECTIONSEL6_Offset];
        // 2-op/4-op channel selection. This register is used here to configure the OPL3.channels[] array.
        this.connectionsel = (_2_connectionsel6 & 0x3F);
        this.set4opConnections();
    }
    
    private set4opConnections() {
        
        // bits 0, 1, 2 sets respectively 2-op channels (1,4), (2,5), (3,6) to 4-op operation.
        // bits 3, 4, 5 sets respectively 2-op channels (10,13), (11,14), (12,15) to 4-op operation.
        for(let array=0; array<2; array++)
            for(let i=0; i<3; i++) {
                if(this._new == 1) {
                    let shift = array*3 + i;
                    let connectionBit = (this.connectionsel >> shift) & 0x01;
                    if(connectionBit == 1) {
                        this.channels[array][i] = this.channels4op[array][i];
                        this.channels[array][i+3] = this.disabledChannel;
                        this.channels[array][i].updateChannel();
                        continue;    
                    }
                }
                this.channels[array][i] = this.channels2op[array][i];
                this.channels[array][i+3] = this.channels2op[array][i+3];
                this.channels[array][i].updateChannel();
                this.channels[array][i+3].updateChannel();
            }
    } 
    
    private setRhythmMode() {
            if(this.ryt==1) {
                this.channels[0][6] = this.bassDrumChannel;
                this.channels[0][7] = this.highHatSnareDrumChannel;
                this.channels[0][8] = this.tomTomTopCymbalChannel;
                this.operators[0][0x11] = this.highHatOperator;
                this.operators[0][0x14] = this.snareDrumOperator;
                this.operators[0][0x12] = this.tomTomOperator;
                this.operators[0][0x15] = this.topCymbalOperator;
            }
            else {
                for(let i=6; i<=8; i++) this.channels[0][i] = this.channels2op[0][i];
                this.operators[0][0x11] = this.highHatOperatorInNonRhythmMode;
                this.operators[0][0x14] = this.snareDrumOperatorInNonRhythmMode;
                this.operators[0][0x12] = this.tomTomOperatorInNonRhythmMode;
                this.operators[0][0x15] = this.topCymbalOperatorInNonRhythmMode;                
            }
            for(let i=6; i<=8; i++) this.channels[0][i].updateChannel();
    }
}


//
// Channels
//


abstract class Channel {
    public channelBaseAddress;
    
    protected feedback : Float32Array;
    
    protected fnuml :number=0;
    protected fnumh :number=0;
    protected kon :number=0;
    protected block :number=0;
    protected cha :number=0;
    protected chb :number=0;
    protected chc :number=0;
    protected chd :number=0;
    protected fb :number=0;
    protected cnt :number=0;

    // Factor to convert between normalized amplitude to normalized
    // radians. The amplitude maximum is equivalent to 8*Pi radians.
    protected toPhase:number = 4; 
    
    constructor (protected opl:OPL3, baseAddress:number) {
        this.channelBaseAddress = baseAddress;
        this.feedback = new Float32Array(2);
        this.feedback[0] = this.feedback[1] = 0;
    }
    
    public update_2_KON1_BLOCK3_FNUMH2() {
        
        let _2_kon1_block3_fnumh2 = this.opl.registers[this.channelBaseAddress+ChannelData._2_KON1_BLOCK3_FNUMH2_Offset];
        
        // Frequency Number (hi-register) and Block. These two registers, together with fnuml, 
        // sets the Channel´s base frequency;
        this.block = (_2_kon1_block3_fnumh2 & 0x1C) >> 2;
        this.fnumh = _2_kon1_block3_fnumh2 & 0x03;        
        this.updateOperators();
        
        // Key On. If changed, calls Channel.keyOn() / keyOff().
        let newKon   = (_2_kon1_block3_fnumh2 & 0x20) >> 5;
        if(newKon != this.kon) {
            if(newKon == 1) this.keyOn();
            else this.keyOff();
            this.kon = newKon;
        }
    }
    
    public update_FNUML8() {
        let fnuml8 = this.opl.registers[this.channelBaseAddress+ChannelData.FNUML8_Offset];
        // Frequency Number, low register.
        this.fnuml = fnuml8&0xFF;        
        this.updateOperators();
    }

    public update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1() {
        let chd1_chc1_chb1_cha1_fb3_cnt1 = this.opl.registers[this.channelBaseAddress+ChannelData.CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset];
        this.chd   = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x80) >> 7;
        this.chc   = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x40) >> 6;
        this.chb   = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x20) >> 5;
        this.cha   = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x10) >> 4;
        this.fb    = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x0E) >> 1;
        this.cnt   = chd1_chc1_chb1_cha1_fb3_cnt1 & 0x01;
        this.updateOperators();
    }
    
    public updateChannel() {
        this.update_2_KON1_BLOCK3_FNUMH2();
        this.update_FNUML8();
        this.update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1();
    }
    
    protected getInFourChannels(channelOutput:number): Float32Array {
        let output:Float32Array = new Float32Array(4);
        
        if( this.opl._new==0) 
            output[0] = output[1] = output[2] = output[3] = channelOutput;    
        else {
            output[0] = (this.cha==1) ? channelOutput : 0;
            output[1] = (this.chb==1) ? channelOutput : 0;
            output[2] = (this.chc==1) ? channelOutput : 0;
            output[3] = (this.chd==1) ? channelOutput : 0;
        }
        
        return output;        
    }

    abstract getChannelOutput() : Float32Array;
    protected abstract keyOn() : void;
    protected abstract keyOff(): void;
    protected abstract updateOperators(): void;
}


class Channel2op extends Channel {
    public op1: Operator;
    public op2: Operator;
    
    constructor (opl:OPL3, baseAddress:number, o1:Operator, o2:Operator) {
        super(opl, baseAddress);
        this.op1 = o1;
        this.op2 = o2;
    }

    public getChannelOutput(): Float32Array {
        let channelOutput = 0, op1Output = 0, op2Output = 0;
        let output:Float32Array; 
        // The feedback uses the last two outputs from
        // the first operator, instead of just the last one. 
        let feedbackOutput = (this.feedback[0] + this.feedback[1]) / 2;

        
        switch(this.cnt) {
            // CNT = 0, the operators are in series, with the first in feedback.
            case 0:
                if(this.op2.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF) 
                    return this.getInFourChannels(0);
                op1Output = this.op1.getOperatorOutput(feedbackOutput);
                channelOutput = this.op2.getOperatorOutput(op1Output*this.toPhase);
                break;
            // CNT = 1, the operators are in parallel, with the first in feedback.    
            case 1:
                if(this.op1.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF && 
                    this.op2.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF) 
                        return this.getInFourChannels(0);                
                op1Output = this.op1.getOperatorOutput(feedbackOutput);
                op2Output = this.op2.getOperatorOutput(Operator.noModulator);
                channelOutput = (op1Output + op2Output) / 2;
        }
        
        this.feedback[0] = this.feedback[1];
        this.feedback[1] = (op1Output * ChannelData.feedback[this.fb])%1;        
        output = this.getInFourChannels(channelOutput);
        return output;
    }
    
    public keyOn() {        
        this.op1.keyOn();
        this.op2.keyOn();
        this.feedback[0] = this.feedback[1] = 0;        
    }
    
    public keyOff() {
        this.op1.keyOff();
        this.op2.keyOff();
    }
    
    public updateOperators() {
        // Key Scale Number, used in EnvelopeGenerator.setActualRates().
        let keyScaleNumber = this.block*2 + ((this.fnumh>>this.opl.nts)&0x01);
        let f_number = (this.fnumh<<8) | this.fnuml;           
        this.op1.updateOperator(keyScaleNumber, f_number, this.block);        
        this.op2.updateOperator(keyScaleNumber, f_number, this.block);        
    }
    
    
    public toString(): String {
        let str = "";
        
        let f_number = (this.fnumh<<8)+this.fnuml;

        str += "channelBaseAddress: %d\n", this.channelBaseAddress;
        str += "f_number: %d, block: %d\n", f_number, this.block;
        str += "cnt: %d, feedback: %d\n", this.cnt, this.fb;
        str += "op1:\n%s", this.op1.toString();
        str += "op2:\n%s", this.op2.toString();
        
        return str.toString();
    }
}


class Channel4op extends Channel {
    private op1: Operator;
    private op2: Operator;
    private op3: Operator;
    private op4: Operator;
    
    constructor (opl:OPL3, baseAddress:number, o1:Operator, o2:Operator, o3:Operator, o4:Operator) {
        super(opl, baseAddress);
        this.op1 = o1;
        this.op2 = o2;
        this.op3 = o3;
        this.op4 = o4;
    }

    public getChannelOutput() :Float32Array {
        let channelOutput = 0; 
        let op1Output = 0;
        let op2Output = 0;
        let op3Output = 0;
        let op4Output = 0;
        
        let output:Float32Array; 
        
        let secondChannelBaseAddress = this.channelBaseAddress+3;
        let secondCnt = this.opl.registers[secondChannelBaseAddress+ChannelData.CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset] & 0x1;
        let cnt4op = (this.cnt << 1) | secondCnt;
        
        let feedbackOutput = (this.feedback[0] + this.feedback[1]) / 2;
        
        switch(cnt4op) {
            case 0:
                if(this.op4.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF) 
                    return this.getInFourChannels(0);                
                
                op1Output = this.op1.getOperatorOutput(feedbackOutput);
                op2Output = this.op2.getOperatorOutput(op1Output*this.toPhase);
                op3Output = this.op3.getOperatorOutput(op2Output*this.toPhase);
                channelOutput = this.op4.getOperatorOutput(op3Output*this.toPhase);
                
                break;
            case 1:
                if(this.op2.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF && 
                    this.op4.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF) 
                       return this.getInFourChannels(0);                
                
                op1Output = this.op1.getOperatorOutput(feedbackOutput);
                op2Output = this.op2.getOperatorOutput(op1Output*this.toPhase);
                
                op3Output = this.op3.getOperatorOutput(Operator.noModulator);
                op4Output = this.op4.getOperatorOutput(op3Output*this.toPhase);

                channelOutput = (op2Output + op4Output) / 2;
                break;
            case 2:
                if(this.op1.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF && 
                    this.op4.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF) 
                       return this.getInFourChannels(0);                
                
                op1Output = this.op1.getOperatorOutput(feedbackOutput);
                
                op2Output = this.op2.getOperatorOutput(Operator.noModulator);
                op3Output = this.op3.getOperatorOutput(op2Output*this.toPhase);
                op4Output = this.op4.getOperatorOutput(op3Output*this.toPhase);

                channelOutput = (op1Output + op4Output) / 2;
                break;
            case 3:
                if(this.op1.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF && 
                    this.op3.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF && 
                    this.op4.envelopeGenerator.stage==EnvelopeGenerator.Stage.OFF) 
                       return this.getInFourChannels(0);                
                
                op1Output = this.op1.getOperatorOutput(feedbackOutput);
                
                op2Output = this.op2.getOperatorOutput(Operator.noModulator);
                op3Output = this.op3.getOperatorOutput(op2Output*this.toPhase);
                
                op4Output = this.op4.getOperatorOutput(Operator.noModulator);

                channelOutput = (op1Output + op3Output + op4Output) / 3;
        }
        
        this.feedback[0] = this.feedback[1];
        this.feedback[1] = (op1Output * ChannelData.feedback[this.fb])%1;
        
        output = this.getInFourChannels(channelOutput);
        return output;
    }

    protected keyOn() {
        this.op1.keyOn();
        this.op2.keyOn();
        this.op3.keyOn();
        this.op4.keyOn();
        this.feedback[0] = this.feedback[1] = 0;           
    }
    
    protected keyOff() {
        this.op1.keyOff();
        this.op2.keyOff();
        this.op3.keyOff();
        this.op4.keyOff();
    }
    
    protected updateOperators() {
        // Key Scale Number, used in EnvelopeGenerator.setActualRates().
        let keyScaleNumber = this.block*2 + ((this.fnumh>>this.opl.nts)&0x01);
        let f_number = (this.fnumh<<8) | this.fnuml;        
        this.op1.updateOperator(keyScaleNumber, f_number, this.block);        
        this.op2.updateOperator(keyScaleNumber, f_number, this.block);        
        this.op3.updateOperator(keyScaleNumber, f_number, this.block);        
        this.op4.updateOperator(keyScaleNumber, f_number, this.block);        
    }
    

    public toString() :String {
        let str = "";
        
        let f_number = (this.fnumh<<8)+this.fnuml;

        str += "channelBaseAddress: %d\n", this.channelBaseAddress;
        str += "f_number: %d, block: %d\n", f_number, this.block;
        str += "cnt: %d, feedback: %d\n", this.cnt, this.fb;
        str += "op1:\n%s", this.op1.toString();
        str += "op2:\n%s", this.op2.toString();
        str += "op3:\n%s", this.op3.toString();
        str += "op4:\n%s", this.op4.toString();
        
        return str;
    }    
}

/** There's just one instance of this class, that fills the eventual gaps in the Channel array; */
class DisabledChannel extends Channel {

    constructor(opl:OPL3) {
        super(opl, 0);
    }
    
    public getChannelOutput() :Float32Array { return this.getInFourChannels(0); }    
    public keyOn() { }
    public keyOff() { }
    public updateOperators() { }    
}



//
// Operators
//
class Operator {
    public phaseGenerator:PhaseGenerator;
    public envelopeGenerator:EnvelopeGenerator;
    
    public envelope=0;
    public phase=0;
    
    public operatorBaseAddress = 0;
    public am = 0;
    public vib = 0;
    public ksr = 0;
    public egt = 0;
    public mult = 0;
    public ksl = 0;
    public tl = 0;
    public ar = 0;
    public dr = 0;
    public sl = 0;
    public rr = 0;
    public ws = 0; 
    public keyScaleNumber=0
    public f_number=0;
    public block=0;
    
    public static noModulator:number = 0;
    
    constructor(protected opl:OPL3, baseAddress:number) {
        this.operatorBaseAddress = baseAddress;
        this.phaseGenerator = new PhaseGenerator(opl);
        this.envelopeGenerator = new EnvelopeGenerator(opl);
    }
    
    public update_AM1_VIB1_EGT1_KSR1_MULT4() {
        
        let am1_vib1_egt1_ksr1_mult4 = this.opl.registers[this.operatorBaseAddress+OperatorData.AM1_VIB1_EGT1_KSR1_MULT4_Offset];
        
        // Amplitude Modulation. This register is used int EnvelopeGenerator.getEnvelope();
        this.am  = (am1_vib1_egt1_ksr1_mult4 & 0x80) >> 7;
        // Vibrato. This register is used in PhaseGenerator.getPhase();
        this.vib = (am1_vib1_egt1_ksr1_mult4 & 0x40) >> 6;
        // Envelope Generator Type. This register is used in EnvelopeGenerator.getEnvelope();
        this.egt = (am1_vib1_egt1_ksr1_mult4 & 0x20) >> 5;
        // Key Scale Rate. Sets the actual envelope rate together with rate and keyScaleNumber.
        // This register os used in EnvelopeGenerator.setActualAttackRate().
        this.ksr = (am1_vib1_egt1_ksr1_mult4 & 0x10) >> 4;
        // Multiple. Multiplies the Channel.baseFrequency to get the Operator.operatorFrequency.
        // This register is used in PhaseGenerator.setFrequency().
        this.mult = am1_vib1_egt1_ksr1_mult4 & 0x0F;
        
        this.phaseGenerator.setFrequency(this.f_number, this.block, this.mult);
        this.envelopeGenerator.setActualAttackRate(this.ar, this.ksr, this.keyScaleNumber);        
        this.envelopeGenerator.setActualDecayRate(this.dr, this.ksr, this.keyScaleNumber); 
        this.envelopeGenerator.setActualReleaseRate(this.rr, this.ksr, this.keyScaleNumber);        
    }
    
    public update_KSL2_TL6() {
        
        let ksl2_tl6 = this.opl.registers[this.operatorBaseAddress+OperatorData.KSL2_TL6_Offset];
        
        // Key Scale Level. Sets the attenuation in accordance with the octave.
        this.ksl = (ksl2_tl6 & 0xC0) >> 6;
        // Total Level. Sets the overall damping for the envelope.
        this.tl  =  ksl2_tl6 & 0x3F;
        
        this.envelopeGenerator.setAtennuation(this.f_number, this.block, this.ksl);
        this.envelopeGenerator.setTotalLevel(this.tl);
    }
    
    public update_AR4_DR4() {
        
        let ar4_dr4 = this.opl.registers[this.operatorBaseAddress+OperatorData.AR4_DR4_Offset];
        
        // Attack Rate.
        this.ar = (ar4_dr4 & 0xF0) >> 4;
        // Decay Rate.
        this.dr =  ar4_dr4 & 0x0F;

        this.envelopeGenerator.setActualAttackRate(this.ar, this.ksr, this.keyScaleNumber);        
        this.envelopeGenerator.setActualDecayRate(this.dr, this.ksr, this.keyScaleNumber); 
    }
    
    public update_SL4_RR4() {     
        
        let sl4_rr4 = this.opl.registers[this.operatorBaseAddress+OperatorData.SL4_RR4_Offset];
        
        // Sustain Level.
        this.sl = (sl4_rr4 & 0xF0) >> 4;
        // Release Rate.
        this.rr =  sl4_rr4 & 0x0F;
        
        this.envelopeGenerator.setActualSustainLevel(this.sl);        
        this.envelopeGenerator.setActualReleaseRate(this.rr, this.ksr, this.keyScaleNumber);        
    }
    
    public update_5_WS3() {     
        let _5_ws3 = this.opl.registers[this.operatorBaseAddress+OperatorData._5_WS3_Offset];
        this.ws =  _5_ws3 & 0x07;
    }
    
    public getOperatorOutput(modulator:number):number {
        if(this.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF) return 0;
        
        let envelopeInDB:number = this.envelopeGenerator.getEnvelope(this.egt, this.am);
        this.envelope = Math.pow(10, envelopeInDB/10.0);
        
        // If it is in OPL2 mode, use first four waveforms only:
        this.ws &= ((this.opl._new<<2) + 3); 
        let waveform:Float32Array = OperatorData.waveforms[this.ws];
        
        this.phase = this.phaseGenerator.getPhase(this.vib);
        
        let operatorOutput = this.getOutput(modulator, this.phase, waveform);
        return operatorOutput;
    }
    
    public getOutput(modulator:number, outputPhase:number, waveform:Float32Array):number {
        outputPhase = (outputPhase + modulator) % 1;
        if(outputPhase<0) {
            outputPhase++;
            // If the double could not afford to be less than 1:
            outputPhase %= 1;
        }
        let sampleIndex = (outputPhase * OperatorData.waveLength) | 0;
        return waveform[sampleIndex] * this.envelope;
    }    

    public keyOn() {
        if(this.ar > 0) {
            this.envelopeGenerator.keyOn();
            this.phaseGenerator.keyOn();
        }
        else this.envelopeGenerator.stage = EnvelopeGenerator.Stage.OFF;
    }
    
    public keyOff() {
        this.envelopeGenerator.keyOff();
    }
 
    public updateOperator(ksn:number, f_num:number, blk:number) {
        this.keyScaleNumber = ksn;
        this.f_number = f_num;
        this.block = blk;
        this.update_AM1_VIB1_EGT1_KSR1_MULT4();
        this.update_KSL2_TL6();
        this.update_AR4_DR4();
        this.update_SL4_RR4();     
        this.update_5_WS3();    
    }
    

    public toString():String {
        let str = "";
        
        let operatorFrequency = this.f_number * Math.pow(2, this.block-1) * OPL3Data.sampleRate / Math.pow(2,19)*OperatorData.multTable[this.mult];

        str += "operatorBaseAddress: %d\n", this.operatorBaseAddress;
        str += "operatorFrequency: %f\n", operatorFrequency;
        str += "mult: %d, ar: %d, dr: %d, sl: %d, rr: %d, ws: %d\n", this.mult, this.ar, this.dr, this.sl, this.rr, this.ws;
        str += "am: %d, vib: %d, ksr: %d, egt: %d, ksl: %d, tl: %d\n", this.am, this.vib, this.ksr, this.egt, this.ksl, this.tl;
                
        return str;
    }    
    
}


//
// Envelope Generator
//


class EnvelopeGenerator {
    private static INFINITY:Float32Array = null;    
    public stage:EnvelopeGenerator.Stage = EnvelopeGenerator.Stage.OFF;
    private actualAttackRate = 0;
    private actualDecayRate = 0;
    private actualReleaseRate;        
    private xAttackIncrement = 0;
    private xMinimumInAttack = 0;            
    private dBdecayIncrement = 0; 
    private dBreleaseIncrement = 0;       
    private attenuation = 0;
    private totalLevel = 0;
    private sustainLevel = 0; 
    private x=0;
    private envelope = 0;
    
    constructor(private opl:OPL3) {
        this.x = this.dBtoX(-96);
        this.envelope = -96;        
    }
    
    public setActualSustainLevel(sl:number) {
        // If all SL bits are 1, sustain level is set to -93 dB:
       if(sl == 0x0F) {
           this.sustainLevel = -93;
           return;
       } 
       // The datasheet states that the SL formula is
       // sustainLevel = -24*d7 -12*d6 -6*d5 -3*d4,
       // translated as:
       this.sustainLevel = -3*sl;
    }

    public setTotalLevel(tl:number):void {
       // The datasheet states that the TL formula is
       // TL = -(24*d5 + 12*d4 + 6*d3 + 3*d2 + 1.5*d1 + 0.75*d0),
       // translated as:
       this.totalLevel = tl*-0.75;
    }
    
    public setAtennuation(f_number: number, block: number, ksl: number) {
        let hi4bits = (f_number>>6)&0x0F;
        switch(ksl) {
            case 0:
                this.attenuation = 0;
                break;
            case 1:
                // ~3 dB/Octave
                this.attenuation = OperatorData.ksl3dBtable[hi4bits][block];
                break;
            case 2:
                // ~1.5 dB/Octave
                this.attenuation = OperatorData.ksl3dBtable[hi4bits][block]/2;
                break;
            case 3:
                // ~6 dB/Octave
                this.attenuation = OperatorData.ksl3dBtable[hi4bits][block]*2;
        }
    }

    public setActualAttackRate(attackRate:number, ksr:number, keyScaleNumber:number) {
        // According to the YMF278B manual's OPL3 section, the attack curve is exponential,
        // with a dynamic range from -96 dB to 0 dB and a resolution of 0.1875 dB 
        // per level.
        //
        // This method sets an attack increment and attack minimum value 
        // that creates a exponential dB curve with 'period0to100' seconds in length
        // and 'period10to90' seconds between 10% and 90% of the curve total level.
        this.actualAttackRate = this.calculateActualRate(attackRate, ksr, keyScaleNumber);
        let period0to100inSeconds = (EnvelopeGeneratorData.attackTimeValuesTable[this.actualAttackRate][0]/1000);
        let period0to100inSamples = (period0to100inSeconds*OPL3Data.sampleRate) | 0;       
        let period10to90inSeconds = (EnvelopeGeneratorData.attackTimeValuesTable[this.actualAttackRate][1]/1000);
        let period10to90inSamples = (period10to90inSeconds*OPL3Data.sampleRate) | 0;
        // The x increment is dictated by the period between 10% and 90%:
        this.xAttackIncrement = OPL3Data.calculateIncrement(this.percentageToX(0.1), this.percentageToX(0.9), period10to90inSeconds);
        // Discover how many samples are still from the top.
        // It cannot reach 0 dB, since x is a logarithmic parameter and would be
        // negative infinity. So we will use -0.1875 dB as the resolution
        // maximum.
        //
        // percentageToX(0.9) + samplesToTheTop*xAttackIncrement = dBToX(-0.1875); ->
        // samplesToTheTop = (dBtoX(-0.1875) - percentageToX(0.9)) / xAttackIncrement); ->
        // period10to100InSamples = period10to90InSamples + samplesToTheTop; ->
        let period10to100inSamples = (period10to90inSamples + (this.dBtoX(-0.1875) - this.percentageToX(0.9)) / this.xAttackIncrement) | 0;
        // Discover the minimum x that, through the attackIncrement value, keeps 
        // the 10%-90% period, and reaches 0 dB at the total period:
        this.xMinimumInAttack = this.percentageToX(0.1) - (period0to100inSamples-period10to100inSamples)*this.xAttackIncrement;
    } 
    
    
    public setActualDecayRate(decayRate:number, ksr:number, keyScaleNumber:number) {
        this.actualDecayRate = this.calculateActualRate(decayRate, ksr, keyScaleNumber);
        let period10to90inSeconds = EnvelopeGeneratorData.decayAndReleaseTimeValuesTable[this.actualDecayRate][1]/1000;
        // Differently from the attack curve, the decay/release curve is linear.        
        // The dB increment is dictated by the period between 10% and 90%:
        this.dBdecayIncrement = OPL3Data.calculateIncrement(this.percentageToDB(0.1), this.percentageToDB(0.9), period10to90inSeconds);
    }
    
    public setActualReleaseRate(releaseRate:number, ksr:number, keyScaleNumber:number) {
        this.actualReleaseRate =  this.calculateActualRate(releaseRate, ksr, keyScaleNumber);
        let period10to90inSeconds = EnvelopeGeneratorData.decayAndReleaseTimeValuesTable[this.actualReleaseRate][1]/1000;
        this.dBreleaseIncrement = OPL3Data.calculateIncrement(this.percentageToDB(0.1), this.percentageToDB(0.9), period10to90inSeconds);
    } 
    
    public calculateActualRate(rate:number, ksr:number, keyScaleNumber:number) {
        let rof = EnvelopeGeneratorData.rateOffset[ksr][keyScaleNumber];
        let actualRate = rate*4 + rof;
        // If, as an example at the maximum, rate is 15 and the rate offset is 15, 
        // the value would
        // be 75, but the maximum allowed is 63:
        if(actualRate > 63) actualRate = 63;
        return actualRate;
    }
    
    public getEnvelope(egt:number, am:number) {
        // The datasheets attenuation values
        // must be halved to match the real OPL3 output.
        let envelopeSustainLevel = this.sustainLevel / 2;
        let envelopeTremolo = OPL3Data.tremoloTable[this.opl.dam][this.opl.tremoloIndex] / 2;
        let envelopeAttenuation = this.attenuation / 2;
        let envelopeTotalLevel = this.totalLevel / 2;
        
        let envelopeMinimum = -96;
        let envelopeResolution = 0.1875;

        let outputEnvelope;
        //
        // Envelope Generation
        //
        switch(this.stage) {
            case EnvelopeGenerator.Stage.ATTACK:
                // Since the attack is exponential, it will never reach 0 dB, so
                // we´ll work with the next to maximum in the envelope resolution.
                if(this.envelope<-envelopeResolution && this.xAttackIncrement != -Infinity) {
                    // The attack is exponential.
                    this.envelope = -Math.pow(2,this.x);
                    this.x += this.xAttackIncrement;
                    break;
                }
                else {
                    // It is needed here to explicitly set envelope = 0, since
                    // only the attack can have a period of
                    // 0 seconds and produce an infinity envelope increment.
                    this.envelope = 0;
                    this.stage = EnvelopeGenerator.Stage.DECAY;
                }
            case EnvelopeGenerator.Stage.DECAY:   
                // The decay and release are linear.                
                if(this.envelope>envelopeSustainLevel) {
                    this.envelope -= this.dBdecayIncrement;
                    break;
                }
                else 
                   this. stage = EnvelopeGenerator.Stage.SUSTAIN;
            case EnvelopeGenerator.Stage.SUSTAIN:
                // The Sustain stage is mantained all the time of the Key ON,
                // even if we are in non-sustaining mode.
                // This is necessary because, if the key is still pressed, we can
                // change back and forth the state of EGT, and it will release and
                // hold again accordingly.
                if(egt==1) break;                
                else {
                    if(this.envelope > envelopeMinimum)
                        this.envelope -= this.dBreleaseIncrement;
                    else this.stage = EnvelopeGenerator.Stage.OFF;
                }
                break;
            case EnvelopeGenerator.Stage.RELEASE:
                // If we have Key OFF, only here we are in the Release stage.
                // Now, we can turn EGT back and forth and it will have no effect,i.e.,
                // it will release inexorably to the Off stage.
                if(this.envelope > envelopeMinimum) 
                    this.envelope -= this.dBreleaseIncrement;
                else this.stage = EnvelopeGenerator.Stage.OFF;
        }
        
        // Ongoing original envelope
        outputEnvelope = this.envelope;    
        
        //Tremolo
        if(am == 1) outputEnvelope += envelopeTremolo;

        //Attenuation
        outputEnvelope += envelopeAttenuation;

        //Total Level
        outputEnvelope += envelopeTotalLevel;

        return outputEnvelope;
    }

    public keyOn() {
        // If we are taking it in the middle of a previous envelope, 
        // start to rise from the current level:
        // envelope = - (2 ^ x); ->
        // 2 ^ x = -envelope ->
        // x = log2(-envelope); ->
        let xCurrent = OperatorData.log2(-this.envelope);
        this.x = xCurrent <this. xMinimumInAttack ? xCurrent : this.xMinimumInAttack;
        this.stage = EnvelopeGenerator.Stage.ATTACK;
    }
    
    public keyOff() {
        if(this.stage != EnvelopeGenerator.Stage.OFF) this.stage = EnvelopeGenerator.Stage.RELEASE;
    }
    
    public dBtoX(dB:number) :number {
        return OperatorData.log2(-dB);
    }

    public percentageToDB(percentage:number):number {
        return Math.log10(percentage)*10;
    }    
    
    public percentageToX(percentage:number):number {
        return this.dBtoX(this.percentageToDB(percentage));
    }  
    

    public toString():String {
        let str = "";

        str += "Envelope Generator: \n";
        let attackPeriodInSeconds = EnvelopeGeneratorData.attackTimeValuesTable[this.actualAttackRate][0]/1000;
        str += "\tATTACK  %f s, rate %d. \n", attackPeriodInSeconds, this.actualAttackRate;
        let decayPeriodInSeconds = EnvelopeGeneratorData.decayAndReleaseTimeValuesTable[this.actualDecayRate][0]/1000;
        str += "\tDECAY   %f s, rate %d. \n",decayPeriodInSeconds, this.actualDecayRate;
        str += "\tSL      %f dB. \n", this.sustainLevel;
        let releasePeriodInSeconds = EnvelopeGeneratorData.decayAndReleaseTimeValuesTable[this.actualReleaseRate][0]/1000;
        str += "\tRELEASE %f s, rate %d. \n", releasePeriodInSeconds,this.actualReleaseRate;
        str += "\n";
        
        return str.toString();
    }     
}

module EnvelopeGenerator {
    export class Stage {
        public static ATTACK = 'ATTACK';
        public static DECAY = 'DECAY';
        public static SUSTAIN = 'SUSTAIN';
        public static RELEASE = 'RELEASE';
        public static OFF: string = 'OFF';
    };
}



//
// Phase Generator
//


class PhaseGenerator {
    private phase = 0;
    private phaseIncrement = 0;
    
    constructor(private opl:OPL3) {

    }
    
    public setFrequency(f_number:number, block:number, mult:number) {
        // This frequency formula is derived from the following equation:
        // f_number = baseFrequency * pow(2,19) / sampleRate / pow(2,block-1);        
        let baseFrequency = f_number * Math.pow(2, block-1) * OPL3Data.sampleRate / Math.pow(2,19);
        let operatorFrequency = baseFrequency*OperatorData.multTable[mult];
        
        // phase goes from 0 to 1 at 
        // period = (1/frequency) seconds ->
        // Samples in each period is (1/frequency)*sampleRate =
        // = sampleRate/frequency ->
        // So the increment in each sample, to go from 0 to 1, is:
        // increment = (1-0) / samples in the period -> 
        // increment = 1 / (OPL3Data.sampleRate/operatorFrequency) ->
        this.phaseIncrement = operatorFrequency/OPL3Data.sampleRate;
    }
    
    public getPhase(vib:number):number {
        if(vib==1) 
            // phaseIncrement = (operatorFrequency * vibrato) / sampleRate
            this.phase += this.phaseIncrement*OPL3Data.vibratoTable[this.opl.dvb][this.opl.vibratoIndex];
        else 
            // phaseIncrement = operatorFrequency / sampleRate
            this.phase += this.phaseIncrement;
        this.phase %= 1;
        return this.phase;
    }
    
    public keyOn() {
        this.phase = 0;
    }
       
    public toString():String {
         return "Operator frequency: "+ OPL3Data.sampleRate*this.phaseIncrement +" Hz.\n";
    }
}


//
// Rhythm
//

/** The getOperatorOutput() method in TopCymbalOperator, HighHatOperator and SnareDrumOperator 
// were made through purely empyrical reverse engineering of the OPL3 output. */
abstract class RhythmChannel extends Channel2op {
    
    constructor(opl:OPL3, baseAddress:number, o1:Operator, o2:Operator) {
        super(opl, baseAddress, o1, o2);        
    }
    

    public getChannelOutput():Float32Array { 
        let channelOutput = 0;
        let op1Output = 0;
        let op2Output = 0;
        let output:Float32Array; 
        
        // Note that, different from the common channel,
        // we do not check to see if the Operator's envelopes are Off.
        // Instead, we always do the calculations, 
        // to update the publicly available phase.
        op1Output = this.op1.getOperatorOutput(Operator.noModulator);
        op2Output = this.op2.getOperatorOutput(Operator.noModulator);        
        channelOutput = (op1Output + op2Output) / 2;
        
        output = this.getInFourChannels(channelOutput);        
        return output;
    };
    
    // Rhythm channels are always running, 
    // only the envelope is activated by the user.

    public keyOn() :void { };

    public keyOff():void { };    
}

class HighHatSnareDrumChannel extends RhythmChannel {
    static highHatSnareDrumChannelBaseAddress:number = 7;
    
    constructor(opl:OPL3) {
        super(opl, HighHatSnareDrumChannel.highHatSnareDrumChannelBaseAddress,
                                opl.highHatOperator, 
                                opl.snareDrumOperator);
    }    
}

class TomTomTopCymbalChannel extends RhythmChannel {
    static tomTomTopCymbalChannelBaseAddress:number = 8;    
    
    constructor(opl:OPL3) {
        super(opl, TomTomTopCymbalChannel.tomTomTopCymbalChannelBaseAddress,
                                opl.tomTomOperator, 
                                opl.topCymbalOperator);
    }
}
 
class TopCymbalOperator extends Operator {
    
    constructor(opl:OPL3, baseAddress:number = 0x15) {
        super(opl, baseAddress);
    }
    
    
    public getOperatorOutput(modulator:number) {
        let highHatOperatorPhase = this.opl.highHatOperator.phase * OperatorData.multTable[this.opl.highHatOperator.mult];
        // The Top Cymbal operator uses his own phase together with the High Hat phase.
        return this.getOperatorOutputEx(modulator, highHatOperatorPhase);
    }

    // This method is used here with the HighHatOperator phase
    // as the externalPhase. 
    // Conversely, this method is also used through inheritance by the HighHatOperator, 
    // now with the TopCymbalOperator phase as the externalPhase.
    protected getOperatorOutputEx(modulator:number , externalPhase:number ) :number {
        let envelopeInDB = this.envelopeGenerator.getEnvelope(this.egt, this.am);
        this.envelope = Math.pow(10, envelopeInDB/10.0);
        
        this.phase = this.phaseGenerator.getPhase(this.vib);
        
        let waveIndex = this.ws & ((this.opl._new<<2) + 3); 
        let waveform:Float32Array = OperatorData.waveforms[waveIndex];
        
        // Empirically tested multiplied phase for the Top Cymbal:
        let carrierPhase = (8 * this.phase)%1;
        let modulatorPhase = externalPhase;
        let modulatorOutput = this.getOutput(Operator.noModulator,modulatorPhase, waveform);
        let carrierOutput = this.getOutput(modulatorOutput,carrierPhase, waveform);
        
        let cycles = 4; 
        if( (carrierPhase*cycles)%cycles > 0.1) carrierOutput = 0;
        
        return carrierOutput*2;  
    }    
}

class HighHatOperator extends TopCymbalOperator {
    private static highHatOperatorBaseAddress = 0x11;     
    
    constructor(opl:OPL3) {
        super(opl, HighHatOperator.highHatOperatorBaseAddress);
    }
    

    public getOperatorOutput(modulator:number):number {
        let topCymbalOperatorPhase = 
            this.opl.topCymbalOperator.phase * OperatorData.multTable[this.opl.topCymbalOperator.mult];
        // The sound output from the High Hat resembles the one from
        // Top Cymbal, so we use the parent method and modifies his output
        // accordingly afterwards.
        let operatorOutput = super.getOperatorOutputEx(modulator, topCymbalOperatorPhase);
        if(operatorOutput == 0) operatorOutput = Math.random()*this.envelope;
        return operatorOutput;
    }
    
}

class SnareDrumOperator extends Operator {
    static snareDrumOperatorBaseAddress = 0x14;
    
    constructor(opl:OPL3) {
        super(opl, SnareDrumOperator.snareDrumOperatorBaseAddress);
    }
    
    public getOperatorOutput(modulator:number):number {
        if(this.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF) return 0;
        
        let envelopeInDB = this.envelopeGenerator.getEnvelope(this.egt, this.am);
        this.envelope = Math.pow(10, envelopeInDB/10.0);
        
        // If it is in OPL2 mode, use first four waveforms only:
        let waveIndex = this.ws & ((this.opl._new<<2) + 3); 
        let waveform:Float32Array = OperatorData.waveforms[waveIndex];
        
        this.phase = this.opl.highHatOperator.phase * 2;
        
        let operatorOutput = this.getOutput(modulator, this.phase, waveform);

        let noise = Math.random() * this.envelope;        
        
        if(operatorOutput/this.envelope != 1 && operatorOutput/this.envelope != -1) {
            if(operatorOutput > 0)  operatorOutput = noise;
            else if(operatorOutput < 0) operatorOutput = -noise;
            else operatorOutput = 0;            
        }
        
        return operatorOutput*2;
    }    
}

class TomTomOperator extends Operator {
    private static tomTomOperatorBaseAddress = 0x12;

    constructor(opl:OPL3) {
        super(opl, TomTomOperator.tomTomOperatorBaseAddress);
    }
}

class BassDrumChannel extends Channel2op {
    private static bassDrumChannelBaseAddress = 6;
    private static op1BaseAddress = 0x10; 
    private static op2BaseAddress = 0x13;
    
    constructor (opl:OPL3) {
        super(opl, BassDrumChannel.bassDrumChannelBaseAddress, new Operator(opl, BassDrumChannel.op1BaseAddress), new Operator(opl, BassDrumChannel.op2BaseAddress));
    }

    public getChannelOutput():Float32Array {
        // Bass Drum ignores first operator, when it is in series.
        if(this.cnt == 1) this.op1.ar=0;
        return super.getChannelOutput();
    }    
    
    // Key ON and OFF are unused in rhythm channels.

    public keyOn():void {    }    

    public keyOff():void {    }    
}


//
// OPl3 Data
//


class OPL3Data {
    
    // OPL3-wide registers offsets:
    static _1_NTS1_6_Offset = 0x08;
    static DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1_Offset = 0xBD;
    static _7_NEW1_Offset = 0x105;
    static _2_CONNECTIONSEL6_Offset = 0x104;

    static sampleRate = 49700;
    
    public static init() {
        this.loadVibratoTable();
        this.loadTremoloTable();
    }
   
    static vibratoTable:Float32Array[];    
    private static loadVibratoTable():void {

        // According to the YMF262 datasheet, the OPL3 vibrato repetition rate is 6.1 Hz.
        // According to the YMF278B manual, it is 6.0 Hz. 
        // The information that the vibrato table has 8 levels standing 1024 samples each
        // was taken from the emulator by Jarek Burczynski and Tatsuyuki Satoh,
        // with a frequency of 6,06689453125 Hz, what  makes sense with the difference 
        // in the information on the datasheets.
        
        // The first array is used when DVB=0 and the second array is used when DVB=1.
        this.vibratoTable = [new Float32Array(8192), new Float32Array(8192)];
        
        let semitone:number = Math.pow(2,1/12);
        // A cent is 1/100 of a semitone:
        let cent = Math.pow(semitone, 1/100);
        
        // When dvb=0, the depth is 7 cents, when it is 1, the depth is 14 cents.
        let DVB0 = Math.pow(cent,7);
        let DVB1 = Math.pow(cent,14);

        let i;
        for(i = 0; i<1024; i++) 
            this.vibratoTable[0][i] = this.vibratoTable[1][i] = 1;        
        for(;i<2048; i++) {
            this.vibratoTable[0][i] = Math.sqrt(DVB0);
            this.vibratoTable[1][i] = Math.sqrt(DVB1);
        }
        for(;i<3072; i++) {
            this.vibratoTable[0][i] = DVB0;
            this.vibratoTable[1][i] = DVB1;
        }
        for(;i<4096; i++) {
            this.vibratoTable[0][i] = Math.sqrt(DVB0);
            this.vibratoTable[1][i] = Math.sqrt(DVB1);
        }
        for(; i<5120; i++) 
            this.vibratoTable[0][i] = this.vibratoTable[1][i] = 1;        
        for(;i<6144; i++) {
            this.vibratoTable[0][i] = 1/Math.sqrt(DVB0);
            this.vibratoTable[1][i] = 1/Math.sqrt(DVB1);
        }
        for(;i<7168; i++) {
            this.vibratoTable[0][i] = 1/DVB0;
            this.vibratoTable[1][i] = 1/DVB1;
        }
        for(;i<8192; i++) {
            this.vibratoTable[0][i] = 1/Math.sqrt(DVB0);
            this.vibratoTable[1][i] = 1/Math.sqrt(DVB1);
        }
        
    }

    public static tremoloTable : Float32Array[];
    public static loadTremoloTable() {

        // The OPL3 tremolo repetition rate is 3.7 Hz.  
        let tremoloFrequency = 3.7;
        
        // The tremolo depth is -1 dB when DAM = 0, and -4.8 dB when DAM = 1.
        let tremoloDepth = [-1, -4.8];

        //  According to the YMF278B manual's OPL3 section graph, 
        //              the tremolo waveform is not 
        //   \      /   a sine wave, but a single triangle waveform.
        //    \    /    Thus, the period to achieve the tremolo depth is T/2, and      
        //     \  /     the increment in each T/2 section uses a frequency of 2*f.
        //      \/      Tremolo varies from 0 dB to depth, to 0 dB again, at frequency*2:
        let tremoloIncrement = [
            this.calculateIncrement(tremoloDepth[0],0,1/(2*tremoloFrequency)),
            this.calculateIncrement(tremoloDepth[1],0,1/(2*tremoloFrequency))
        ];
        
        let tremoloTableLength = (this.sampleRate/tremoloFrequency) | 0;
        
        // First array used when AM = 0 and second array used when AM = 1.
        this.tremoloTable = [new Float32Array(13432), new Float32Array(13432)];

        // This is undocumented. The tremolo starts at the maximum attenuation,
        // instead of at 0 dB:
        this.tremoloTable[0][0] = tremoloDepth[0];
        this.tremoloTable[1][0] = tremoloDepth[1];

        let counter = 0;
        // The first half of the triangle waveform:
        while(this.tremoloTable[0][counter]<0) {
            counter++;
            this.tremoloTable[0][counter] = this.tremoloTable[0][counter-1] + tremoloIncrement[0];
            this.tremoloTable[1][counter] = this.tremoloTable[1][counter-1] + tremoloIncrement[1];
        }
        // The second half of the triangle waveform:
        while(this.tremoloTable[0][counter]>tremoloDepth[0] && counter<tremoloTableLength-1) {
            counter++;
            this.tremoloTable[0][counter] = this.tremoloTable[0][counter-1] - tremoloIncrement[0];
            this.tremoloTable[1][counter] = this.tremoloTable[1][counter-1] - tremoloIncrement[1];
        }

    }
    
    static calculateIncrement(begin:number, end:number, period:number):number {
        return (end-begin)/this.sampleRate * (1/period);
    }
    
}

OPL3Data.init();

//
// Channel Data
// 


class ChannelData {
    
    static _2_KON1_BLOCK3_FNUMH2_Offset = 0xB0;
    static FNUML8_Offset = 0xA0;
    static CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset = 0xC0;
    
    // Feedback rate in fractions of 2*Pi, normalized to (0,1): 
    // 0, Pi/16, Pi/8, Pi/4, Pi/2, Pi, 2*Pi, 4*Pi turns to be:
    static feedback:number[] = [0,1/32,1/16,1/8,1/4,1/2,1,2];
}


//
// Operator Data
//


class OperatorData {
            
    static AM1_VIB1_EGT1_KSR1_MULT4_Offset = 0x20;
    static KSL2_TL6_Offset = 0x40;
    static AR4_DR4_Offset = 0x60;
    static SL4_RR4_Offset = 0x80;
    static _5_WS3_Offset = 0xE0;       

    static  waveLength = 1024;
    
    static multTable = [0.5,1,2,3,4,5,6,7,8,9,10,10,12,12,15,15];
    
    static ksl3dBtable: number[][] = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,-3,-6,-9],
        [0,0,0,0,-3,-6,-9,-12],
        [0,0,0, -1.875, -4.875, -7.875, -10.875, -13.875],
        
        [0,0,0,-3,-6,-9,-12,-15],
        [0,0, -1.125, -4.125, -7.125, -10.125, -13.125, -16.125], 
        [0,0, -1.875, -4.875, -7.875, -10.875, -13.875, -16.875],
        [0,0, -2.625, -5.625, -8.625, -11.625, -14.625, -17.625],
        
        [0,0,-3,-6,-9,-12,-15,-18],
        [0, -0.750, -3.750, -6.750, -9.750, -12.750, -15.750, -18.750],
        [0, -1.125, -4.125, -7.125, -10.125, -13.125, -16.125, -19.125],
        [0, -1.500, -4.500, -7.500, -10.500, -13.500, -16.500, -19.500],
        
        [0, -1.875, -4.875, -7.875, -10.875, -13.875, -16.875, -19.875],
        [0, -2.250, -5.250, -8.250, -11.250, -14.250, -17.250, -20.250],
        [0, -2.625, -5.625, -8.625, -11.625, -14.625, -17.625, -20.625],
        [0,-3,-6,-9,-12,-15,-18,-21]
    ];
    
    static waveforms:Float32Array[];

    public static init() {
        OperatorData.loadWaveforms();        
    }
    
    private static loadWaveforms():void {
        //OPL3 has eight waveforms:
        this.waveforms =  [
            new Float32Array(1024), new Float32Array(1024), new Float32Array(1024), new Float32Array(1024),
            new Float32Array(1024), new Float32Array(1024), new Float32Array(1024), new Float32Array(1024)
        ];
        
        let i;
        // 1st waveform: sinusoid.
        let theta = 0, thetaIncrement = 2*Math.PI / 1024;
        
        for(i=0, theta=0; i<1024; i++, theta += thetaIncrement)
            this.waveforms[0][i] = Math.sin(theta);
        
        let sineTable = this.waveforms[0];
        // 2nd: first half of a sinusoid.
        for(i=0; i<512; i++) {
            this.waveforms[1][i] = sineTable[i];
            this.waveforms[1][512+i] = 0;
        } 
        // 3rd: double positive sinusoid.
        for(i=0; i<512; i++) 
            this.waveforms[2][i] = this.waveforms[2][512+i] = sineTable[i];         
        // 4th: first and third quarter of double positive sinusoid.
        for(i=0; i<256; i++) {
            this.waveforms[3][i] = this.waveforms[3][512+i] = sineTable[i];
            this.waveforms[3][256+i] = this.waveforms[3][768+i] = 0;
        }
        // 5th: first half with double frequency sinusoid.
        for(i=0; i<512; i++) {
            this.waveforms[4][i] = sineTable[i*2];
            this.waveforms[4][512+i] = 0;
        } 
        // 6th: first half with double frequency positive sinusoid.
        for(i=0; i<256; i++) {
            this.waveforms[5][i] = this.waveforms[5][256+i] = sineTable[i*2];
            this.waveforms[5][512+i] = this.waveforms[5][768+i] = 0;
        }
        // 7th: square wave
        for(i=0; i<512; i++) {
            this.waveforms[6][i] = 1;
            this.waveforms[6][512+i] = -1;
        }                
        // 8th: exponential
        let x;
        let xIncrement = 1 * 16 / 256;
        for(i=0, x=0; i<512; i++, x+=xIncrement) {
            this.waveforms[7][i] = Math.pow(2,-x);
            this.waveforms[7][1023-i] = -Math.pow(2,-(x + 1/16));
        }
        
    }  
    
    static log2(x:number):number {
        return Math.log(x)/Math.log(2);
    }    
}

OperatorData.init();

module OperatorData {
    export class type {
        public static NO_MODULATION = 'NO_MODULATION';
        public static CARRIER = 'CARRIER';
        public static FEEDBACK = 'FEEDBACK';

    };
}



//
// Envelope Generator Data
//


class EnvelopeGeneratorData {
    
     // This table is indexed by the value of Operator.ksr 
    // and the value of ChannelRegister.keyScaleNumber.
    static rateOffset = [
        [0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3],
        [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
    ];
    // These attack periods in miliseconds were taken from the YMF278B manual. 
    // The attack actual rates range from 0 to 63, with different data for 
    // 0%-100% and for 10%-90%: 
    static attackTimeValuesTable = [
            [Infinity,Infinity],    [Infinity,Infinity],    [Infinity,Infinity],    [Infinity,Infinity],
            [2826.24,1482.75], [2252.80,1155.07], [1884.16,991.23], [1597.44,868.35],
            [1413.12,741.38], [1126.40,577.54], [942.08,495.62], [798.72,434.18],
            [706.56,370.69], [563.20,288.77], [471.04,247.81], [399.36,217.09],
            
            [353.28,185.34], [281.60,144.38], [235.52,123.90], [199.68,108.54],
            [176.76,92.67], [140.80,72.19], [117.76,61.95], [99.84,54.27],
            [88.32,46.34], [70.40,36.10], [58.88,30.98], [49.92,27.14],
            [44.16,23.17], [35.20,18.05], [29.44,15.49], [24.96,13.57],
            
            [22.08,11.58], [17.60,9.02], [14.72,7.74], [12.48,6.78],
            [11.04,5.79], [8.80,4.51], [7.36,3.87], [6.24,3.39],
            [5.52,2.90], [4.40,2.26], [3.68,1.94], [3.12,1.70],
            [2.76,1.45], [2.20,1.13], [1.84,0.97], [1.56,0.85],
            
            [1.40,0.73], [1.12,0.61], [0.92,0.49], [0.80,0.43],
            [0.70,0.37], [0.56,0.31], [0.46,0.26], [0.42,0.22],
            [0.38,0.19], [0.30,0.14], [0.24,0.11], [0.20,0.11],
            [0.00,0.00], [0.00,0.00], [0.00,0.00], [0.00,0.00]
    ];

    // These decay and release periods in miliseconds were taken from the YMF278B manual. 
    // The rate index range from 0 to 63, with different data for 
    // 0%-100% and for 10%-90%: 
    static decayAndReleaseTimeValuesTable = [
            [Infinity,Infinity],    [Infinity,Infinity],    [Infinity,Infinity],    [Infinity,Infinity],
            [39280.64,8212.48], [31416.32,6574.08], [26173.44,5509.12], [22446.08,4730.88],
            [19640.32,4106.24], [15708.16,3287.04], [13086.72,2754.56], [11223.04,2365.44],
            [9820.16,2053.12], [7854.08,1643.52], [6543.36,1377.28], [5611.52,1182.72],
            
            [4910.08,1026.56], [3927.04,821.76], [3271.68,688.64], [2805.76,591.36],
            [2455.04,513.28], [1936.52,410.88], [1635.84,344.34], [1402.88,295.68],
            [1227.52,256.64], [981.76,205.44], [817.92,172.16], [701.44,147.84],
            [613.76,128.32], [490.88,102.72], [488.96,86.08], [350.72,73.92],
            
            [306.88,64.16], [245.44,51.36], [204.48,43.04], [175.36,36.96],
            [153.44,32.08], [122.72,25.68], [102.24,21.52], [87.68,18.48],
            [76.72,16.04], [61.36,12.84], [51.12,10.76], [43.84,9.24],
            [38.36,8.02], [30.68,6.42], [25.56,5.38], [21.92,4.62],
            
            [19.20,4.02], [15.36,3.22], [12.80,2.68], [10.96,2.32],
            [9.60,2.02], [7.68,1.62], [6.40,1.35], [5.48,1.15],
            [4.80,1.01], [3.84,0.81], [3.20,0.69], [2.74,0.58],
            [2.40,0.51], [2.40,0.51], [2.40,0.51], [2.40,0.51]
    ];
    
}

}