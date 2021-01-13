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
import { MixerChannel } from './mixer-channel';


export class Handler {

    public chip: Chip = new Chip();

    public WriteAddr(port: number /* int */, val: number /* byte */): number /** int */ {
        return this.chip.WriteAddr(port, val);
    }

    public WriteReg(addr: number /* int */, val: number /* byte */): void {
        this.chip.WriteReg(addr, val);
    }

    public Generate(chan: MixerChannel, samples: number /* short */): void {
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

    public Init(rate: number /* short */): void {
        GlobalMembers.InitTables();
        this.chip.Setup(rate);
    }
}

