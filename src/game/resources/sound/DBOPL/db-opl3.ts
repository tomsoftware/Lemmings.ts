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

/*
	DOSBox implementation of a combined Yamaha YMF262 and Yamaha YM3812 emulator.
	Enabling the opl3 bit will switch the emulator to stereo opl3 output instead of regular mono opl2
	Except for the table generation it's all integer math
	Can choose different types of generators, using muls and bigger tables, try different ones for slower platforms
	The generation was based on the MAME implementation but tried to have it use less memory and be faster in general
	MAME uses much bigger envelope tables and this will be the biggest cause of it sounding different at times

	//TODO Don't delay first operator 1 sample in opl3 mode
	//TODO Maybe not use class method pointers but a regular function pointers with operator as first parameter
	//TODO Fix panning for the Percussion channels, would any opl3 player use it and actually really change it though?
	//TODO Check if having the same accuracy in all frequency multipliers sounds better or not

	//DUNNO Keyon in 4op, switch to 2op without keyoff.
*/

/* $Id: dbopl.cpp,v 1.10 2009-06-10 19:54:51 harekiet Exp $ */


import { IOpl3 } from '../opl3';
import { Handler } from './handler';
import { MixerChannel } from './mixer-channel';


export enum SynthMode {
	sm2AM,
	sm2FM,
	sm3AM,
	sm3FM,
	sm4Start,
	sm3FMFM,
	sm3AMFM,
	sm3FMAM,
	sm3AMAM,
	sm6Start,
	sm2Percussion,
	sm3Percussion
}

// Shifts for the values contained in chandata variable
export enum Shifts {
	SHIFT_KSLBASE = 16,
	SHIFT_KEYCODE = 24,
};


// Max buffer size.  Since only 512 samples can be generated at a time, setting
// this to 512 * 2 channels means it'll be the largest it'll ever need to be.

const BUFFER_SIZE_SAMPLES = 1024

export class OPL implements IOpl3 {
	private dbopl: Handler = new Handler();
	private buffer: Int16Array;
	private mixer: MixerChannel;

	constructor(freq: number, channels: number) {

		this.buffer = new Int16Array(BUFFER_SIZE_SAMPLES * channels);
		this.mixer = new MixerChannel(this.buffer, channels);
		this.dbopl.Init(freq);
	}


	public write(reg: number, val: number) {
		this.dbopl.WriteReg(reg, val);
	}


	public generate(lenSamples: number) {
		if (lenSamples > 512) {
			throw new Error('OPL.generate() cannot generate more than 512 samples per call');
		}
		if (lenSamples < 2) {
			throw new Error('OPL.generate() cannot generate fewer than 2 samples per call');
		}
		this.dbopl.Generate(this.mixer, lenSamples);

		return this.buffer;
	}
}

