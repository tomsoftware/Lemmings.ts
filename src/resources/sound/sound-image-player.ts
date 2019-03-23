/// <reference path="../file/binary-reader.ts"/>
/// <reference path="sound-image-manager.ts"/>

module Lemmings {

  /** interface for data callback - returns a OPC command from the Sondimage format */
  export interface AdlibCommandCallback { (reg: number, value: number): void };


  /**
   * Player for the SoundImage File for one track that needs to be 
   * played. 
  */
  export class SoundImagePlayer {

    private reader: BinaryReader

    /** every track is composed of several channel. */
    private channels: SoundImageChannels[] = [];

    /** Config for this soundimage file */
    private fileConfig: AudioConfig;

    /** how many channels does the current track uese */
    private channelCount: number;

    /** variables for the song */
    public songHeaderPosition: number;
    public unknownWord: number;

    /** cycles to wait between data sending */
    public waitCycles: number;
    public currentCycle: number = 0;

    /** File pos of instruments */
    public instrumentPos: number;

    constructor(reader: BinaryReader, private audioConfig: AudioConfig) {

      /// create a new reader for the data
      this.reader = new BinaryReader(reader);
      this.fileConfig = audioConfig;
    }


    /** init for a sound */
    public initSound(soundIndex: number) {
      ///- reset
      this.channels = [];
      this.channelCount = 0;


      /// check if valid
      if ((soundIndex < 0) || (soundIndex > 17)) return;

      /// create channel : the original DOS Soundimage format player use channels >= 8 for sounds...but this shouldn't matter
      var ch: SoundImageChannels = this.createChannel(8);


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

      this.unknownWord = this.reader.readWordBE();
      this.instrumentPos = this.reader.readWordBE() + this.fileConfig.instructionsOffset;
      this.waitCycles = this.reader.readByte();

      this.channelCount = this.reader.readByte();


      /// create channels and set there programm position
      for (var i = 0; i < this.channelCount; i++) {

        /// create channels
        var ch: SoundImageChannels = this.createChannel(i);

        /// config channel
        ch.programPointer = this.reader.readWordBE() + this.fileConfig.instructionsOffset;
        ch.instrumentPos = this.instrumentPos;

        ch.initMusic();

        this.channels.push(ch);
      }

      this.debug();
    }


    /** create an SoundImage Channel and init it */
    private createChannel(chIndex): SoundImageChannels {

      var ch = new SoundImageChannels(this.reader, this.fileConfig);

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
      for (var i = 0; i < this.channelCount; i++) {
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

      for (var i = 0; i < this.channelCount; i++) {
        let ch = this.channels[i];
        commandCallback(ch.di08h_l, ch.di08h_h);
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

      let error = new LogHandler("SoundImagePlayer");

      error.debug(this.fileConfig);
      error.debug("channelCount: " + this.channelCount);

      error.debug("songHeaderPosition: " + this.songHeaderPosition);
      error.debug("unknownWord: " + this.unknownWord);

      error.debug("waitCycles: " + this.waitCycles);
      error.debug("currentCycle: " + this.currentCycle);
      error.debug("instrumentPos: " + this.instrumentPos);
    }

  }

}