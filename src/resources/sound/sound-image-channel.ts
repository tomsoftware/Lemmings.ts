/// <reference path="../file/binary-reader.ts"/>
/// <reference path="sound-image-reader.ts"/>

module Lemmings {

  enum AdliChannelsPlayingType {
      NONE,
      SOUND,
      MUSIC,
  }

  /** a adlib channel of the sound image file */
  export class SoundImageChannels {

    private index : number;

    public di00h : number = 0;
    public Wait: number = 0;
    public di02h: number = 0;
    public di04h : number = 0;
    public di05h_h: number = 0;
    public di05h_l : number = 0;
    public di07h : number = 0;
    public di08h_l : number = 0;
    public di08h_h : number = 0;
    public ProgramPosition : number = 0; /// -> todo: better name: programmPointer
    public channelPosition: number = 0;
    public di0Fh : number = 0;
    public WaitSum : number = 0;
    public di12h : number = 0;
    public di13h: number = 0;

    /** only play if this is true */
    public playingState : AdliChannelsPlayingType = AdliChannelsPlayingType.NONE;

    /** some constants */
    public soundImageVersion : number;

    /** word_8AC */
    public instrumentPos: number;
  
    //private word_8B0:number; //- end of song?!
    //private word_E7:number; //- channel count


    private reader : BinaryReader;
		private error : ErrorHandler = new ErrorHandler("AdliChannels");

    private fileConfig: AudioConfig

    constructor(reader: BinaryReader, 
                index : number,
                audioConfig:AudioConfig) {

      this.fileConfig = audioConfig;
      this.index = index;
      this.reader = new BinaryReader(reader);
    }



    /** read the channel data and write it to the callback */
    public read(commandCallback: AdlibCommandCallback) {
      if (this.playingState == AdliChannelsPlayingType.NONE) return;

      this.Wait--;

      let saveChannelPosition = this.channelPosition;

      if (this.Wait <= 0) {
        if (this.soundImageVersion == 1) {
          this.readBarVersion1(commandCallback);
        } else {
          this.readBarVersion2(commandCallback);
        }

        return;
      }
    
      if (this.di13h != 0) {
        
        this.di00h = this.di00h + this.di13h;
        this.setFrequency(commandCallback);
      }
    
      if (this.reader.readByte(saveChannelPosition) != 0x82) {
        if (this.reader.readByte(this.di02h + 0xE) == this.Wait) {
            commandCallback(this.di08h_l, this.di08h_h);
            this.di13h = 0
        }
      }
    }



    private readBarVersion1(commandCallback: AdlibCommandCallback) {

      var cmdPos = this.channelPosition;

        while (true) {

          var cmd = this.reader.readByte(cmdPos)
          cmdPos++;
        
          if ((cmd & 0x80) == 0) {

            this.setFrequencyHigh(commandCallback, cmd);
            this.channelPosition = cmdPos;
            return;

          } else if ((cmd >= 0xE0)) {
            
            this.setWaitSum(cmd - 0xDF);

          } else if ((cmd >= 0xC0)) {
          
            this.setEnvelope (commandCallback, cmd - 0xC0);

          } else if ((cmd <= 0xB0)) {
          
            cmdPos = this.part3(commandCallback, cmd, cmdPos);
            if (cmdPos < 0) return;
            
          } else {

            this.setLevel(commandCallback, cmdPos);
            cmdPos++;
          }
        }
    }


    private readBarVersion2(commandCallback: AdlibCommandCallback) {

        var cmdPos:number = this.channelPosition;
        
        while (true) {
          var cmd = this.reader.readByte(cmdPos)
          cmdPos++;

          if ((cmd & 0x80) == 0) {
          
            this.setFrequencyHigh(commandCallback, cmd);
            this.channelPosition = cmdPos;
            return;

          } else if ((cmd >= 0xE0)) {

            this.setWaitSum(cmd - 0xDF);
            
          } else if ((cmd <= 0xA0)) {
            
            cmdPos = this.part3(commandCallback, cmd, cmdPos);
            if (cmdPos < 0) return;

        
          } else {
          
            this.setEnvelope (commandCallback, cmd - 0xA0);
          }
        }

    }


    private setFrequencyHigh(commandCallback: AdlibCommandCallback, cmd:number) {

      this.di00h = cmd;
      commandCallback(this.di08h_l, this.di08h_h);

      this.setFrequency(commandCallback);
      

      this.Wait = this.WaitSum;
    }


    private setWaitSum(cmd:number){
      this.WaitSum = (cmd);
    }




    private setFrequency(commandCallback: AdlibCommandCallback) {

      var mainPos = ((this.di00h + this.di12h) & 0xFF) + 4;
      var octave = this.reader.readByte(mainPos + this.fileConfig.sub_306_POS1)
      var pos = this.reader.readByte(mainPos + this.fileConfig.sub_306_POS2)
      var frequenze = this.reader.readWordBE(this.fileConfig.sub_306_Param + pos * 32)

      if ((frequenze & 0x8000) == 0) {
        octave--;
      }

      if ((octave & 0x80) > 0) {
        octave++;
        frequenze = frequenze << 1; // * 2
      }

      /// write low part of frequenz
      commandCallback(this.di07h + 0xA0, frequenze & 0xFF);

      /// 0x3 : mask F-Number most sig.
      this.di08h_h = ((frequenze >> 8) & 0x3) | ((octave << 2) & 0xFF);
      this.di08h_l = this.di07h + 0xB0;

      /// write high part of frequenz
      /// 0x20 = set Key On
      commandCallback(this.di08h_l, this.di08h_h | 0x20);
    }



    private setEnvelope(commandCallback: AdlibCommandCallback, cmd:number) {
      var value:number;
      this.di04h = cmd;
      
      var pos = this.instrumentPos;

      if (this.playingState == AdliChannelsPlayingType.SOUND) {
        pos = this.fileConfig.DATA_START_SOUND;
      }

      pos = pos + ((cmd - 1) << 4);


      /// Attack Rate / Decay Rate
      value = this.reader.readByte(pos + 0);
      commandCallback( this.di05h_l + 0x60, value);
      
      value = this.reader.readByte(pos + 1);
      commandCallback( this.di05h_h + 0x60, value);
    
      /// Sustain Level / Release Rate
      value = this.reader.readByte( pos + 2);
      commandCallback( this.di05h_l + 0x80, value);
      
      value = this.reader.readByte(pos + 3);
      commandCallback( this.di05h_h + 0x80, value);

      /// Waveform Select
      value = this.reader.readByte( pos + 6);
      commandCallback( this.di05h_l + 0xE0, value);
      
      value = this.reader.readByte(pos + 7);
      commandCallback( this.di05h_h + 0xE0, value);
      
      /// 0xC0 -'
      value = this.reader.readByte( pos + 9);
      commandCallback( this.di07h + 0xC0, value);
      
      /// 0x20 -'
      value = this.reader.readByte( pos + 4);
      commandCallback( this.di05h_l + 0x20, value);
      
      value = this.reader.readByte( pos + 5);
      commandCallback( this.di05h_h + 0x20, value);
      
    
      /// other
      this.di12h = this.reader.readByte(pos + 8);
      this.di0Fh = this.reader.readByte(pos + 11);
      this.di02h = pos;
      
      this.setLevel(commandCallback, pos + 10);
    
    }



    private part3(commandCallback: AdlibCommandCallback, cmd:number, cmdPos: number): number { 

      /// für case brauchen wir nicht
      
      switch (cmd & 0xF) {
        case 0:

          var tmpPos = this.ProgramPosition;

          var cx = this.reader.readWordBE(tmpPos);
          tmpPos +=  2;
          
          if (cx == 0) {

              tmpPos = this.reader.readWordBE(tmpPos) + this.fileConfig.DATA_CMD;
              cmdPos = this.reader.readWordBE(tmpPos) + this.fileConfig.DATA_CMD;

              tmpPos += 2;
          } else {
              cmdPos = cx + this.fileConfig.DATA_CMD;
          }

          this.ProgramPosition = tmpPos;
          this.channelPosition = cmdPos;

          break;


        case 1:
          /// set frequenze hight
          commandCallback(this.di08h_l, this.di08h_h);
          
          this.di13h = 0;
          this.channelPosition = cmdPos;
          this.Wait = this.WaitSum;
          
          return -1;


        case 2:
          this.channelPosition = cmdPos;
          this.Wait = this.WaitSum

          return -1;


        case 3:
          this.error.log("not implemented - end of song");
          // Todo: 
          ///-- reset all chanels ----

          /*
          for (var i:number = 0; i< this.word_8B0; i++) {
  
            var ah = this.di08h_h;
            var al = this.di08h_l;

            commandCallback(al, ah);
            
            this.playingState = AdliChannelsPlayingType.NONE;
          }

          this.word_E7 = 0;
          */
          return -1;

        case 4:
          this.di12h = this.reader.readByte(cmdPos);
          cmdPos++;
          break;

        case 5:
          commandCallback( this.di08h_l, this.di08h_h);
          this.playingState =  AdliChannelsPlayingType.NONE;
          
          return -1;
          
        case 6:
          this.di13h = 1;
          break;
          
        case 7:
          this.di13h = 0xFF;
          break;

        case 8:
          this.setLevel(commandCallback, cmdPos);
          cmdPos++;
          break;

        default:
          this.error.log("unknown command in part3");
      }
      
      
      return cmdPos;
    }



    private setLevel(commandCallback: AdlibCommandCallback, cmdPos:number) {

      var pos = this.reader.readByte(cmdPos);

      var ah = this.reader.readByte((pos & 0x7F) + this.fileConfig.DATA_START);
      var al = this.reader.readByte(this.di02h + 0xC);

      al = (al << 2) & 0xC0;
      ah = ah | al;
      
      commandCallback(this.di05h_l + 0x40, ah);


      pos = this.di0Fh + this.reader.readByte(this.di02h + 0xA) & 0x7F;

      ah = this.reader.readByte(pos + this.fileConfig.DATA_START);
      al = this.reader.readByte(this.di02h + 0xC);
      
      al = (al >> 2) & 0xC0;
      al = al & 0xC0;
      
      ah = ah | al;
      
      commandCallback(this.di05h_h + 0x40, ah);
    }


    /** init this channel for music */
    public initMusic() {
 
        this.channelPosition = this.reader.readWordBE(this.ProgramPosition) + this.fileConfig.DATA_CMD;

        /// move the programm pointer
        this.ProgramPosition += 2;

        this.playingState = AdliChannelsPlayingType.MUSIC;
    }

    /** init this channel for sound */
    public initSound() {

        this.playingState = AdliChannelsPlayingType.SOUND;
    }


    /** read the adlib config for this channel from the giffen offset */
    public initChannel(offset : number) {
 
      offset = offset + this.index * 20; /// 20: Channel-Init-Data-Size

      this.reader.setOffset (offset);

      /// read Cahnnel-Init-Data
      this.di00h = this.reader.readByte();
      this.Wait = this.reader.readByte();
      this.di02h = this.reader.readWordBE();
      this.di04h = this.reader.readByte();
      this.di05h_l = this.reader.readByte(); // todo : l / h?
      this.di05h_h = this.reader.readByte();
      this.di07h = this.reader.readByte();;
      this.di08h_h = this.reader.readByte(); // todo : l / h?
      this.di08h_l = this.reader.readByte();
      this.ProgramPosition = this.reader.readWordBE();
      this.channelPosition = this.reader.readWordBE();
      
      this.reader.readByte(); //- unused

      this.di0Fh = this.reader.readByte();
      this.playingState = this.IntToPlayingState(this.reader.readByte());
      this.WaitSum = this.reader.readByte();
      this.di12h = this.reader.readByte();
      this.di13h = this.reader.readByte();
    }


    /** convert a number to a playState */
    private IntToPlayingState(stateVal: number): AdliChannelsPlayingType
    {
      switch (stateVal)
      {
        case 1:
          return AdliChannelsPlayingType.MUSIC;
        case 2:
          return AdliChannelsPlayingType.SOUND;
        default:
          return AdliChannelsPlayingType.NONE;
      }
    }

  }
}