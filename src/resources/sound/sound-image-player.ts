import { AudioConfig } from '@/game/config/audio-config';
import { LogHandler } from '@/game/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { SoundImageChannels } from './sound-image-channel';


/** interface for data callback - returns a OPC command from the SoundImage format */
export interface AdlibCommandCallback { (reg: number, value: number): void }


/**
 * Player on a Lemmings SoundImage File to playback one track. 
*/
export class SoundImagePlayer {
  private log = new LogHandler('SoundImagePlayer');

  private reader: BinaryReader

  /** every track is composed of several channel. */
  private channels: SoundImageChannels[] = [];

  /** Config for this soundImage file */
  private fileConfig: AudioConfig;

  /** how many channels does the current track uses */
  private channelCount = 0;

  /** variables for the song */
  public songHeaderPosition = 0;
  public sampleRateFactor = 0;

  /** cycles to wait/delay between writing new data to adlib */
  public waitCycles = 0;
  public currentCycle = 0;

  /** File pos of instruments */
  public instrumentPos = 0;

  constructor(reader: BinaryReader, private audioConfig: AudioConfig) {

    /// create a new reader for the data
    this.reader = new BinaryReader(reader);
    this.fileConfig = audioConfig;
  }

  /** Return the samples to be generated */
  public getSamplingInterval() {
    /// this is an empirical value... don't know if this is correct
    return this.sampleRateFactor / 210;
  }

  /** init for a sound */
  public initSound(soundIndex: number) {
    ///- reset
    this.channels = [];
    this.channelCount = 0;
    this.waitCycles = 0;
    this.sampleRateFactor = 0x4300;

    /// check if valid
    if ((soundIndex < 0) || (soundIndex > 17)) return;

    /// create channel : the original DOS SoundImage format player use channels >= 8 for sounds...but this shouldn't matter
    const ch: SoundImageChannels = this.createChannel(8);


    ch.channelPosition = this.reader.readWordBE(this.fileConfig.soundIndexTablePosition + soundIndex * 2);
    ch.waitTime = 1;
    ch.di13h = 0;

    ch.initSound();

    /// add channel
    this.channels.push(ch);
    this.channelCount = 1;
  }



  /** init for a song */
  public initMusic(musicIndex: number) {

    ///- reset
    this.channels = [];
    this.channelCount = 0;

    /// check if valid
    if (musicIndex < 0) return;
    musicIndex = musicIndex % this.fileConfig.numberOfTracks;

    this.songHeaderPosition = this.reader.readWordBE(this.fileConfig.instructionsOffset + musicIndex * 2);

    this.reader.setOffset(this.songHeaderPosition);

    this.sampleRateFactor = this.reader.readWordBE();
    this.instrumentPos = this.reader.readWordBE() + this.fileConfig.instructionsOffset;
    this.waitCycles = this.reader.readByte();

    this.channelCount = this.reader.readByte();


    /// create channels and set there programm position
    for (let i = 0; i < this.channelCount; i++) {

      /// create channels
      const ch: SoundImageChannels = this.createChannel(i);

      /// config channel
      ch.programPointer = this.reader.readWordBE() + this.fileConfig.instructionsOffset;
      ch.instrumentPos = this.instrumentPos;

      ch.initMusic();

      this.channels.push(ch);
    }

    this.debug();
  }


  /** create an SoundImage Channel and init it */
  private createChannel(chIndex: number): SoundImageChannels {

    const ch = new SoundImageChannels(this.reader, this.fileConfig);

    ch.initChannel(this.fileConfig.adlibChannelConfigPosition, chIndex);

    ch.waitTime = 1;
    ch.soundImageVersion = this.fileConfig.version;

    return ch;
  }


  /// are the init Commands send?
  private initCommandsDone = false;


  /** reads the next block of data: call this to process the next data of this channel */
  public read(commandCallback: AdlibCommandCallback) {

    if (this.currentCycle > 0) {
      /// wait some time
      this.currentCycle--;
      return;
    }
    this.currentCycle = this.waitCycles;


    if (!this.initCommandsDone) {
      /// write the init adlib commands if this is the first call
      this.initCommandsDone = true;

      this.doInitTimer(commandCallback);
      this.doInitCommands(commandCallback);
    }

    /// read every channel
    for (let i = 0; i < this.channelCount; i++) {
      this.channels[i].read(commandCallback);
    }

  }

  /** Init the adlib timer */
  private doInitTimer(commandCallback: AdlibCommandCallback) {
    //- Masks Timer 1 and Masks Timer 2
    commandCallback(0x4, 0x60);

    //- Resets the flags for timers 1 & 2. If set, all other bits are ignored
    commandCallback(0x4, 0x80);

    //- Set Value of Timer 1.  The value for this timer is incremented every eighty (80) microseconds
    commandCallback(0x2, 0xFF);

    //- Masks Timer 2 and
    //- The value from byte 02 is loaded into Timer 1, and incrementation begins
    commandCallback(0x4, 0x21);

    //- Masks Timer 1 and Masks Timer 2
    commandCallback(0x4, 0x60);

    //- Resets the flags for timers 1 & 2. If set, all other bits are ignored
    commandCallback(0x4, 0x80);

  }


  /** Return the commands to init the adlib driver */
  private doInitCommands(commandCallback: AdlibCommandCallback) {

    for (let i = 0; i < this.channelCount; i++) {
      const ch = this.channels[i];
      commandCallback(ch.di08hL, ch.di08hH);
    }

    // enabled the FM chips to control the waveform of each operator
    commandCallback(0x01, 0x20);

    /// Set: AM depth is 4.8 dB
    /// Set: Vibrato depth is 14 cent
    commandCallback(0xBD, 0xC0);

    /// selects FM music mode
    ///  keyboard split off
    commandCallback(0x08, 0x00);

    /// Masks Timer 2
    /// the value from byte 02 is loaded into Timer 1, and incrementation begins. 
    commandCallback(0x04, 0x21);
  }


  /** write debug info to console */
  public debug() {

    this.log.debug(this.fileConfig);
    this.log.debug('channelCount: ' + this.channelCount);

    this.log.debug('songHeaderPosition: ' + this.songHeaderPosition);
    this.log.debug('sampleRateFactor: ' + this.sampleRateFactor);

    this.log.debug('waitCycles: ' + this.waitCycles);
    this.log.debug('currentCycle: ' + this.currentCycle);
    this.log.debug('instrumentPos: ' + this.instrumentPos);
  }

}

