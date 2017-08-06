/// <reference path="../file/binary-reader.ts"/>

module Lemmings {

  /** Class to read the Lemmings Sound Image File */
  export class SoundImageManager {

    private data: BinaryReader;
    private fileConfig: AudioConfig;

    constructor(data: BinaryReader, audioConfig: AudioConfig) {

      this.data = data;

      this.fileConfig = audioConfig;
    }

    /** create a AdlibPlyer for a given music track number/index [0..N] */
    public getMusicTrack(trackIndex: number): SoundImagePlayer {

      var player = new SoundImagePlayer(this.data, this.fileConfig);

      player.initMusic(trackIndex);

      return player;
    }



    /** create a AdlibPlyer for a given sound index [0..N] */
    public getSoundTrack(soundIndex: number): SoundImagePlayer {

      var player = new SoundImagePlayer(this.data, this.fileConfig);

      player.initSound(soundIndex);

      return player;
    }

  }
}