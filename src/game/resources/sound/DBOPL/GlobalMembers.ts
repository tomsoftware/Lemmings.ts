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

export abstract class GlobalMembers {

    public static readonly OPLRATE = (14318180.0 / 288.0); // double

    /// How much to substract from the base value for the final attenuation
    public static KslCreateTable = new Uint8Array([
        64, 32, 24, 19,
        16, 12, 11, 10,
        8, 6, 5, 4,
        3, 2, 1, 0]); /* UInt8[]*/


    public static FreqCreateTable = new Uint8Array([
        (0.5 * 2), (1 * 2), (2 * 2), (3 * 2), (4 * 2), (5 * 2), (6 * 2), (7 * 2),
        (8 * 2), (9 * 2), (10 * 2), (10 * 2), (12 * 2), (12 * 2), (15 * 2), (15 * 2)
    ]); /** final UInt8[]  */


    /// We're not including the highest attack rate, that gets a special value
    public static AttackSamplesTable = new Uint8Array([
        69, 55, 46, 40,
        35, 29, 23, 20,
        19, 15, 11, 10,
        9]); /** UInt8 */

    public static EnvelopeIncreaseTable = new Uint8Array([
        4, 5, 6, 7,
        8, 10, 12, 14,
        16, 20, 24, 28,
        32]); /** UInt8 */

    /// Layout of the waveform table in 512 entry intervals
    /// With overlapping waves we reduce the table to half it's size

    /// 	|    |//\\|____|WAV7|//__|/\  |____|/\/\|
    /// 	|\\//|    |    |WAV7|    |  \/|    |    |
    /// 	|06  |0126|17  |7   |3   |4   |4 5 |5   |

    /// 6 is just 0 shifted and masked

    public static WaveTable = new Int16Array(8 * 512); /** Bit16s */

    public static WaveBaseTable = new Uint16Array([
        0x000, 0x200, 0x200, 0x800,
        0xa00, 0xc00, 0x100, 0x400]); /** UInt16 */

    public static WaveMaskTable = new Uint16Array([
        1023, 1023, 511, 511,
        1023, 1023, 512, 1023]); /** UInt16 */

    /// Where to start the counter on at keyon
    public static WaveStartTable = new Uint16Array([
        512, 0, 0, 0,
        0, 512, 512, 256]); /** UInt16 */



    public static MulTable = new Uint16Array(384); /** UInt16[] */

    public static readonly TREMOLO_TABLE = 52;

    public static KslTable = new Uint8Array(8 * 16); /** UInt8[] */
    public static TremoloTable = new Uint8Array(GlobalMembers.TREMOLO_TABLE); /** UInt8[] */

    //Start of a channel behind the chip struct start
    public static ChanOffsetTable = new Int16Array(32); /** UInt16[] */

    //Start of an operator behind the chip struct start
    public static OpOffsetTable = new Int16Array(64); /** UInt16[] */



    //The lower bits are the shift of the operator vibrato value
    //The highest bit is right shifted to generate -1 or 0 for negation
    //So taking the highest input value of 7 this gives 3, 7, 3, 0, -3, -7, -3, 0
    public static VibratoTable = new Int8Array([
        1 - 0x00, 0 - 0x00, 1 - 0x00, 30 - 0x00,
        1 - 0x80, 0 - 0x80, 1 - 0x80, 30 - 0x80]); /** Int8 */

    //Shift strength for the ksl value determined by ksl strength
    public static KslShiftTable = new Uint8Array([31, 1, 2, 0]); /** UInt8 */


    public static EnvelopeSelectShift(val: number /* UInt8  */) {
        if (val < 13 * 4) {//Rate 0 - 12
            return 12 - (val >>> 2);
        }
        else if (val < 15 * 4) { //rate 13 - 14
            return 0;
        }
        else {	//rate 15 and up
            return 0;
        }
    }


    public static EnvelopeSelectIndex(val: number /* UInt8  */) {
        if (val < 13 * 4) {//Rate 0 - 12
            return (val & 3);
        }
        else if (val < 15 * 4) { //rate 13 - 14
            return val - 12 * 4;
        }
        else {	//rate 15 and up
            return 12;
        }
    }



    public static doneTables: boolean = false;

    public static InitTables() {
        if (GlobalMembers.doneTables) {
            return;
        }
        GlobalMembers.doneTables = true;

        /// Multiplication based tables
        for (let i = 0; i < 384; i++) {
            let s = i * 8;
            /// TODO maybe keep some of the precision errors of the original table?
            let val = (0.5 + (Math.pow(2.0, -1.0 + (255 - s) * (1.0 / 256))) * (1 << 16)) | 0;
            GlobalMembers.MulTable[i] = val;
        }

        //Sine Wave Base
        for (let i = 0; i < 512; i++) {
            GlobalMembers.WaveTable[0x0200 + i] = (Math.sin((i + 0.5) * (3.14159265358979323846 / 512.0)) * 4084) | 0;
            GlobalMembers.WaveTable[0x0000 + i] = -GlobalMembers.WaveTable[0x200 + i];
        }

        //Exponential wave
        for (let i = 0; i < 256; i++) {
            GlobalMembers.WaveTable[0x700 + i] = (0.5 + (Math.pow(2.0, -1.0 + (255 - i * 8) * (1.0 / 256))) * 4085) | 0;
            GlobalMembers.WaveTable[0x6ff - i] = -GlobalMembers.WaveTable[0x700 + i];
        }

        for (let i = 0; i < 256; i++) {
            /// Fill silence gaps
            GlobalMembers.WaveTable[0x400 + i] = GlobalMembers.WaveTable[0];
            GlobalMembers.WaveTable[0x500 + i] = GlobalMembers.WaveTable[0];
            GlobalMembers.WaveTable[0x900 + i] = GlobalMembers.WaveTable[0];
            GlobalMembers.WaveTable[0xc00 + i] = GlobalMembers.WaveTable[0];
            GlobalMembers.WaveTable[0xd00 + i] = GlobalMembers.WaveTable[0];
            /// Replicate sines in other pieces
            GlobalMembers.WaveTable[0x800 + i] = GlobalMembers.WaveTable[0x200 + i];
            /// double speed sines
            GlobalMembers.WaveTable[0xa00 + i] = GlobalMembers.WaveTable[0x200 + i * 2];
            GlobalMembers.WaveTable[0xb00 + i] = GlobalMembers.WaveTable[0x000 + i * 2];
            GlobalMembers.WaveTable[0xe00 + i] = GlobalMembers.WaveTable[0x200 + i * 2];
            GlobalMembers.WaveTable[0xf00 + i] = GlobalMembers.WaveTable[0x200 + i * 2];
        }


        /// Create the ksl table
        for (let oct = 0; oct < 8; oct++) {
            let base = (oct * 8) | 0;
            for (let i = 0; i < 16; i++) {
                let val = base - GlobalMembers.KslCreateTable[i];
                if (val < 0) {
                    val = 0;
                }

                /// *4 for the final range to match attenuation range
                GlobalMembers.KslTable[oct * 16 + i] = (val * 4) | 0;
            }
        }

        /// Create the Tremolo table, just increase and decrease a triangle wave
        for (let i = 0; i < 52 / 2; i++) {
            let val = (i << ((9) - 9)) | 0;
            GlobalMembers.TremoloTable[i] = val;
            GlobalMembers.TremoloTable[52 - 1 - i] = val;
        }

        /// Create a table with offsets of the channels from the start of the chip
        for (let i = 0; i < 32; i++) {
            let index = (i & 0xf);
            if (index >= 9) {
                GlobalMembers.ChanOffsetTable[i] = -1;
                continue;
            }
            /// Make sure the four op channels follow eachother
            if (index < 6) {
                index = ((index % 3) * 2 + ((index / 3) | 0)) | 0;
            }
            /// Add back the bits for highest ones
            if (i >= 16) {
                index += 9;
            }

            GlobalMembers.ChanOffsetTable[i] = index;
        }

        /// Same for operators
        for (let i = 0; i < 64; i++) {
            if (i % 8 >= 6 || (((i / 8) | 0) % 4 == 3)) {
                GlobalMembers.OpOffsetTable[i] = 0;
                continue;
            }
            let chNum = (((i / 8) | 0) * 3 + (i % 8) % 3) | 0;
            //Make sure we use 16 and up for the 2nd range to match the chanoffset gap
            if (chNum >= 12) {
                chNum += 16 - 12;
            }
            let opNum = ((i % 8) / 3) | 0;

            if (GlobalMembers.ChanOffsetTable[chNum] == -1) {
                GlobalMembers.OpOffsetTable[i] = -1;
            }
            else {
                let c = GlobalMembers.ChanOffsetTable[chNum];
                GlobalMembers.OpOffsetTable[i] = c * 2 + opNum;
            }

        }
    }
}

