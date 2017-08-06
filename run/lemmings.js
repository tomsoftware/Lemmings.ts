"use strict";
var Lemmings;
(function (Lemmings) {
    /** loads the config and provides an game-resources object */
    class GameFactory {
        constructor(rootPath) {
            this.rootPath = rootPath;
            this.error = new Lemmings.ErrorHandler("GameFactory");
            this.fileProvider = new Lemmings.FileProvider(rootPath);
            let configFileReader = this.fileProvider.loadString("config.json");
            this.configReader = new Lemmings.ConfigReader(configFileReader);
        }
        getGameResources(gameType) {
            return new Promise((resolve, reject) => {
                this.configReader.getConfig(gameType).then(config => {
                    if (config == null) {
                        reject();
                        return;
                    }
                    resolve(new Lemmings.GameResources(this.fileProvider, config));
                });
            });
        }
    }
    Lemmings.GameFactory = GameFactory;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** reprecent access to the resources of a  Lemmings Game */
    class GameResources {
        constructor(fileProvider, config) {
            this.fileProvider = fileProvider;
            this.config = config;
        }
        /** free resources */
        dispose() {
            this.stopMusic();
            this.stopSound();
            this.soundImage = null;
        }
        /** return the Level Data for a given Level-Index */
        getLevel(levelMode, levelIndex) {
            let levelReader = new Lemmings.LevelLoader(this.fileProvider, this.config);
            return levelReader.getLevel(levelMode, levelIndex);
        }
        /** return the level group names for this game */
        getLevelGroups() {
            return this.config.level.groups;
        }
        initSoundImage() {
            if (this.soundImage)
                return this.soundImage;
            this.soundImage = new Promise((resolve, reject) => {
                /// load the adlib file
                this.fileProvider.loadBinary(this.config.path, "ADLIB.DAT")
                    .then((data) => {
                    /// unpack the file
                    var container = new Lemmings.FileContainer(data);
                    /// create Sound Image
                    var soundImage = new Lemmings.SoundImageManager(container.getPart(0), this.config.audioConfig);
                    resolve(soundImage);
                });
            });
            return this.soundImage;
        }
        /** stop playback of the music song */
        stopMusic() {
            if (this.musicPlayer != null) {
                this.musicPlayer.stop();
                this.musicPlayer = null;
            }
        }
        /** return a palyer to playback a music song */
        getMusicPlayer(songIndex) {
            this.stopMusic();
            return new Promise((resolve, reject) => {
                this.initSoundImage().then(soundImage => {
                    /// get track
                    var adlibSrc = soundImage.getMusicTrack(songIndex);
                    /// play
                    this.musicPlayer = new Lemmings.AudioPlayer(adlibSrc);
                    /// return
                    resolve(this.musicPlayer);
                });
            });
        }
        /** stop playback of the music song */
        stopSound() {
            if (this.soundPlayer != null) {
                this.soundPlayer.stop();
                this.soundPlayer = null;
            }
        }
        /** return a palyer to playback a sound effect */
        getSoundPlayer(sondIndex) {
            this.stopSound();
            return new Promise((resolve, reject) => {
                this.initSoundImage().then(soundImage => {
                    /// get track
                    var adlibSrc = soundImage.getSoundTrack(sondIndex);
                    /// play
                    this.soundPlayer = new Lemmings.AudioPlayer(adlibSrc);
                    /// return
                    resolve(this.soundPlayer);
                });
            });
        }
    }
    Lemmings.GameResources = GameResources;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    var GameTypes;
    (function (GameTypes) {
        GameTypes[GameTypes["UNKNOWN"] = 0] = "UNKNOWN";
        GameTypes[GameTypes["LEMMINGS"] = 1] = "LEMMINGS";
        GameTypes[GameTypes["OHNO"] = 2] = "OHNO";
        GameTypes[GameTypes["XMAS91"] = 3] = "XMAS91";
        GameTypes[GameTypes["XMAS92"] = 4] = "XMAS92";
        GameTypes[GameTypes["HOLIDAY93"] = 5] = "HOLIDAY93";
        GameTypes[GameTypes["HOLIDAY94"] = 6] = "HOLIDAY94";
    })(GameTypes = Lemmings.GameTypes || (Lemmings.GameTypes = {}));
    ;
    (function (GameTypes) {
        function toString(type) {
            return GameTypes[type];
        }
        GameTypes.toString = toString;
        function length() {
            return 7;
        }
        GameTypes.length = length;
        function isValid(type) {
            return ((type > GameTypes.UNKNOWN) && (type < this.lenght()));
        }
        GameTypes.isValid = isValid;
        /** return the GameTypes with the given name */
        function fromString(typeName) {
            typeName = typeName.trim().toUpperCase();
            for (let i = 0; i < this.length(); i++) {
                if (GameTypes[i] == typeName)
                    return i;
            }
            return GameTypes.UNKNOWN;
        }
        GameTypes.fromString = fromString;
    })(GameTypes = Lemmings.GameTypes || (Lemmings.GameTypes = {}));
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** the skills/behaviors a Lemming could have */
    var SkillTypes;
    (function (SkillTypes) {
        SkillTypes[SkillTypes["UNKNOWN"] = 0] = "UNKNOWN";
        SkillTypes[SkillTypes["CLIMBER"] = 1] = "CLIMBER";
        SkillTypes[SkillTypes["FLOATER"] = 2] = "FLOATER";
        SkillTypes[SkillTypes["BOMBER"] = 3] = "BOMBER";
        SkillTypes[SkillTypes["BLOCKER"] = 4] = "BLOCKER";
        SkillTypes[SkillTypes["BUILDER"] = 5] = "BUILDER";
        SkillTypes[SkillTypes["BASHER"] = 6] = "BASHER";
        SkillTypes[SkillTypes["MINER"] = 7] = "MINER";
        SkillTypes[SkillTypes["DIGGER"] = 8] = "DIGGER";
    })(SkillTypes = Lemmings.SkillTypes || (Lemmings.SkillTypes = {}));
    ;
    /** helper functions for SkillTypes */
    (function (SkillTypes) {
        function toString(type) {
            return SkillTypes[type];
        }
        SkillTypes.toString = toString;
        function length() {
            return 9;
        }
        SkillTypes.length = length;
        function isValid(type) {
            return ((type > SkillTypes.UNKNOWN) && (type < this.lenght()));
        }
        SkillTypes.isValid = isValid;
    })(SkillTypes = Lemmings.SkillTypes || (Lemmings.SkillTypes = {}));
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    class AudioConfig {
    }
    Lemmings.AudioConfig = AudioConfig;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    class GameConfig {
        constructor() {
            /** Name of the Lemmings Game */
            this.name = "";
            /** Path/Url to the resources */
            this.path = "";
            /** unique GameType Name */
            this.gametype = Lemmings.GameTypes.UNKNOWN;
            this.audioConfig = new Lemmings.AudioConfig();
            this.level = new Lemmings.LevelConfig();
        }
    }
    Lemmings.GameConfig = GameConfig;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    class LevelConfig {
        constructor() {
            /** file Prefix used in the filename of the level-file */
            this.filePrefix = "LEVEL";
            /** use the odd-table-file */
            this.useOddTable = false;
            /** the names of the level groups */
            this.groups = [];
            /** sort order of the levels for each group
             *   every entry is a number where:
             *     ->  (FileId * 10 + FilePart) * (useOddTabelEntry? -1 : 1)
             */
            this.order = [];
        }
    }
    Lemmings.LevelConfig = LevelConfig;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** read the config.json file */
    class ConfigReader {
        constructor(configFile) {
            this.error = new Lemmings.ErrorHandler("ConfigReader");
            this.configs = new Promise((resolve, reject) => {
                configFile.then((jsonString) => {
                    let configJson = this.parseConfig(jsonString);
                    resolve(configJson);
                });
            });
        }
        /** return the game config for a given GameType */
        getConfig(gameType) {
            return new Promise((resolve, reject) => {
                this.configs.then((configs) => {
                    let config = configs.find((type) => type.gametype == gameType);
                    if (config == null) {
                        this.error.log("config for GameTypes:" + Lemmings.GameTypes.toString(gameType) + " not found!");
                        reject();
                        return;
                    }
                    resolve(config);
                });
            });
        }
        /** pars the config file */
        parseConfig(jsonData) {
            let gameConfigs = [];
            try {
                var config = JSON.parse(jsonData);
            }
            catch (e) {
                this.error.log("Unable to parse config", e);
                return gameConfigs;
            }
            /// for all game types
            for (let c = 0; c < config.length; c++) {
                let newConfig = new Lemmings.GameConfig();
                let configData = config[c];
                newConfig.name = configData["name"];
                newConfig.path = configData["path"];
                newConfig.gametype = Lemmings.GameTypes.fromString(configData["gametype"]);
                /// read level config
                if (configData["level.useoddtable"] != null) {
                    newConfig.level.useOddTable = (!!configData["level.useoddtable"]);
                }
                newConfig.level.order = configData["level.order"];
                newConfig.level.filePrefix = configData["level.filePrefix"];
                newConfig.level.groups = configData["level.groups"];
                /// read audio config
                newConfig.audioConfig.version = configData["audio.version"];
                newConfig.audioConfig.adlibChannelConfigPosition = configData["audio.adlibChannelConfigPosition"];
                newConfig.audioConfig.dataOffset = configData["audio.dataOffset"];
                newConfig.audioConfig.frequenciesOffset = configData["audio.frequenciesOffset"];
                newConfig.audioConfig.octavesOffset = configData["audio.octavesOffset"];
                newConfig.audioConfig.frequenciesCountOffset = configData["audio.frequenciesCountOffset"];
                newConfig.audioConfig.instructionsOffset = configData["audio.instructionsOffset"];
                newConfig.audioConfig.soundIndexTablePosition = configData["audio.soundIndexTablePosition"];
                newConfig.audioConfig.soundDataOffset = configData["audio.soundDataOffset"];
                newConfig.audioConfig.numberOfTracks = configData["audio.numberOfTracks"];
                gameConfigs.push(newConfig);
            }
            return gameConfigs;
        }
    }
    Lemmings.ConfigReader = ConfigReader;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** handel error logging */
    class ErrorHandler {
        constructor(moduleName) {
            this._moduleName = moduleName;
        }
        /** log an error */
        log(msg, exeption) {
            console.log(this._moduleName + "\t" + msg);
            if (exeption) {
                console.log(this._moduleName + "\t" + exeption.message);
            }
        }
        /** write a debug message. If [msg] is not a String it is displayed: as {prop:value} */
        debug(msg) {
            if (typeof msg === 'string') {
                console.log(this._moduleName + "\t" + msg);
            }
            else {
                console.dir(msg);
            }
        }
    }
    Lemmings.ErrorHandler = ErrorHandler;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** uses the LevelReader and GroundReader to render the games background */
    class GroundRenderer {
        constructor() {
        }
        readVgaspecMap(lr, vr) {
            this.img = vr.img;
        }
        /** create the ground image from the level definition and the Terrain images */
        readGroundMap(lr, gr) {
            this.img = new Lemmings.GroundImage(lr.levelWidth, lr.levelHeight);
            this.img.clearImageArray();
            let terrarObjects = lr.terrains;
            let terrarImg = gr.imgTerrar;
            for (let i = 0; i < terrarObjects.length; i++) {
                let tOb = terrarObjects[i];
                this.copyImageTo(terrarImg[tOb.id], tOb);
            }
        }
        /** copy a terrain image to the ground */
        copyImageTo(srcImg, destConfig, frameIndex = 0) {
            if (!srcImg)
                return;
            var pixBuf = srcImg.frames[frameIndex];
            var w = srcImg.width;
            var h = srcImg.height;
            var pal = srcImg.pallet;
            var destX = destConfig.x;
            var destY = destConfig.y;
            var upsideDown = destConfig.isUpsideDown;
            var noOverwrite = destConfig.noOverwrite;
            var isErase = destConfig.isErase;
            var onlyOverwrite = destConfig.onlyOverwrite;
            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    let sourceY = upsideDown ? (h - y - 1) : y;
                    /// read source color index
                    let colorIndex = pixBuf[sourceY * w + x];
                    /// ignore transparent pixels
                    if ((colorIndex & 0x80) != 0)
                        continue;
                    if (isErase) {
                        this.img.clearPixel(x + destX, y + destY);
                    }
                    else {
                        this.img.setPixel(x + destX, y + destY, pal.data[colorIndex], noOverwrite, onlyOverwrite);
                    }
                }
            }
        }
    }
    Lemmings.GroundRenderer = GroundRenderer;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    class LevelIndexType {
        constructor() {
            /** use the odd table information for this entry */
            this.useOddTable = false;
        }
    }
    Lemmings.LevelIndexType = LevelIndexType;
    /** matches the Level-Mode + Level-Index to a level-file and level-file-index */
    class LevelIndexResolve {
        constructor(config) {
            this.config = config;
        }
        resolve(levelMode, levelIndex) {
            let levelOrderList = this.config.level.order;
            if (levelOrderList.length <= levelMode)
                return null;
            if (levelMode < 0)
                return null;
            let levelOrder = levelOrderList[levelMode];
            if (levelOrder.length <= levelIndex)
                return null;
            if (levelIndex < 0)
                return null;
            let levelOrderConfig = levelOrder[levelIndex];
            let liType = new LevelIndexType();
            liType.fileId = Math.abs((levelOrderConfig / 10) | 0);
            liType.partIndex = Math.abs((levelOrderConfig % 10) | 0);
            liType.useOddTable = (levelOrderConfig < 0);
            /// the level number is the sum-index of the level
            let levelNo = 0;
            for (let i = 0; i < (levelMode - 1); i++) {
                levelNo += levelOrderList[i].length;
            }
            liType.levelNumber = levelNo + levelIndex;
            return liType;
        }
    }
    Lemmings.LevelIndexResolve = LevelIndexResolve;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** Bootstrap the Level loading */
    class LevelLoader {
        constructor(fileProvider, config) {
            this.fileProvider = fileProvider;
            this.config = config;
            this.error = new Lemmings.ErrorHandler("LevelLoader");
            this.levelIndexResolve = new Lemmings.LevelIndexResolve(config);
        }
        /** return the map and it's config */
        getLevel(levelMode, levelIndex) {
            let level = new Lemmings.Level();
            let levelReader;
            return new Promise((resolve, reject) => {
                let levelInfo = this.levelIndexResolve.resolve(levelMode, levelIndex);
                if (levelInfo == null) {
                    resolve(null);
                    return;
                }
                let useImageMap = false;
                let useOddTable = levelInfo.useOddTable && this.config.level.useOddTable;
                let promiseList = [];
                let paddedFileId = ("0000" + levelInfo.fileId).slice(-3);
                promiseList.push(this.fileProvider.loadBinary(this.config.path, this.config.level.filePrefix + paddedFileId + ".DAT"));
                /// may we need to load the odd-table to?
                if (useOddTable) {
                    promiseList.push(this.fileProvider.loadBinary(this.config.path, "ODDTABLE.DAT"));
                }
                Promise.all(promiseList)
                    .then(files => {
                    /// read the level meta data
                    let levelsContainer = new Lemmings.FileContainer(files[0]);
                    levelReader = new Lemmings.LevelReader(levelsContainer.getPart(levelInfo.partIndex));
                    level.gameType = this.config.gametype;
                    level.levelIndex = levelIndex;
                    level.levelMode = levelMode;
                    level.width = levelReader.levelWidth;
                    level.height = levelReader.levelHeight;
                    level.screenPositionX = levelReader.screenPositionX;
                    level.isSuperLemming = levelReader.isSuperLemming;
                    /// default level properties
                    let levelProperties = levelReader.levelProperties;
                    /// switch level properties to odd table config
                    if (useOddTable) {
                        let oddTable = new Lemmings.OddTableReader(files[1]);
                        levelProperties = oddTable.getLevelProperties(levelInfo.levelNumber);
                    }
                    level.name = levelProperties.levelName;
                    level.releaseRate = levelProperties.releaseRate;
                    level.releaseCount = levelProperties.releaseCount;
                    level.needCount = levelProperties.needCount;
                    level.timeLimit = levelProperties.timeLimit;
                    level.skills = levelProperties.skills;
                    /// load level ground
                    let vgaFilePromise = this.fileProvider.loadBinary(this.config.path, "VGAGR" + levelReader.graphicSet1 + ".DAT");
                    let goundFilePromise;
                    if (levelReader.graphicSet2 == 0) {
                        /// this is an normal map
                        goundFilePromise = this.fileProvider.loadBinary(this.config.path, "GROUND" + levelReader.graphicSet1 + "O.DAT");
                    }
                    else {
                        /// this is a Image Map
                        goundFilePromise = this.fileProvider.loadBinary(this.config.path, "VGASPEC" + (levelReader.graphicSet2 - 1) + ".DAT");
                        useImageMap = true;
                    }
                    return Promise.all([vgaFilePromise, goundFilePromise]);
                })
                    .then((res) => {
                    let goundFile = res[1];
                    let vgaContainer = new Lemmings.FileContainer(res[0]);
                    let render = new Lemmings.GroundRenderer();
                    if (useImageMap) {
                        let vgaspecReader = new Lemmings.VgaspecReader(goundFile);
                        render.readVgaspecMap(levelReader, vgaspecReader);
                    }
                    else {
                        let groundReader = new Lemmings.GroundReader(goundFile, vgaContainer.getPart(1), vgaContainer.getPart(0));
                        render.readGroundMap(levelReader, groundReader);
                    }
                    level.groundImage = render.img.imgData;
                    level.width = render.img.width;
                    level.height = render.img.height;
                    resolve(level);
                });
            });
        }
    }
    Lemmings.LevelLoader = LevelLoader;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** Level Data */
    class Level {
        constructor() {
            this.name = "";
            this.width = 1600;
            this.height = 160;
            this.releaseRate = 0;
            this.releaseCount = 0;
            this.needCount = 0;
            this.timeLimit = 0;
            this.skills = new Array(Lemmings.SkillTypes.length());
            this.screenPositionX = 0;
            this.isSuperLemming = false;
        }
    }
    Lemmings.Level = Level;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** Class to provide a read pointer and readfunctions to a binary Buffer */
    class BinaryReader {
        constructor(dataArray, offset = 0, length, filename = "[unknown]") {
            this._error = new Lemmings.ErrorHandler("BinaryReader");
            this.filename = filename;
            let dataLenght = 0;
            if (dataArray == null) {
                this.data = new Uint8Array(0);
                dataLenght = 0;
                this._error.log("BinaryReader from NULL; size:" + 0);
            }
            else if (dataArray instanceof BinaryReader) {
                //- if dataArray is BinaryReader use there data
                this.data = dataArray.data;
                dataLenght = dataArray.length;
                this._error.log("BinaryReader from BinaryReader; size:" + dataLenght);
            }
            else if (dataArray instanceof Uint8Array) {
                this.data = dataArray;
                dataLenght = dataArray.byteLength;
                this._error.log("BinaryReader from Uint8Array; size:" + dataLenght);
            }
            else if (dataArray instanceof ArrayBuffer) {
                this.data = new Uint8Array(dataArray);
                dataLenght = dataArray.byteLength;
                this._error.log("BinaryReader from ArrayBuffer; size:" + dataLenght);
            }
            else if (dataArray instanceof Blob) {
                this.data = new Uint8Array(dataArray);
                dataLenght = this.data.byteLength;
                this._error.log("BinaryReader from Blob; size:" + dataLenght);
            }
            else {
                this.data = dataArray;
                dataLenght = this.data.length;
                this._error.log("BinaryReader from unknown: " + dataArray + "; size:" + dataLenght);
            }
            if (length == null)
                length = dataLenght - offset;
            this.hiddenOffset = offset;
            this.length = length;
            this.pos = this.hiddenOffset;
        }
        /** Read one Byte from stream */
        readByte(offset) {
            if (offset != null)
                this.pos = (offset + this.hiddenOffset);
            if ((this.pos < 0) || (this.pos > this.data.length)) {
                this._error.log("read out of data: " + this.filename + " - size: " + this.data.length + " @ " + this.pos);
                return 0;
            }
            let v = this.data[this.pos];
            this.pos++;
            return v;
        }
        /** Read one DWord (4 Byte) from stream (little ending) */
        readInt(length = 4, offset) {
            if (offset == null)
                offset = this.pos;
            if (length == 4) {
                let v = (this.data[offset] << 24) | (this.data[offset + 1] << 16) | (this.data[offset + 2] << 8) | (this.data[offset + 3]);
                this.pos = offset + 4;
                return v;
            }
            let v = 0;
            for (let i = length; i > 0; i--) {
                v = (v << 8) | this.data[offset];
                offset++;
            }
            this.pos = offset;
            return v;
        }
        /** Read one DWord (4 Byte) from stream (big ending) */
        readIntBE(offset) {
            if (offset == null)
                offset = this.pos;
            let v = (this.data[offset]) | (this.data[offset + 1] << 8) | (this.data[offset + 2] << 16) | (this.data[offset + 3] << 24);
            this.pos = offset + 4;
            return v;
        }
        /** Read one Word (2 Byte) from stream (big ending) */
        readWord(offset) {
            if (offset == null)
                offset = this.pos;
            let v = (this.data[offset] << 8) | (this.data[offset + 1]);
            this.pos = offset + 2;
            return v;
        }
        /** Read one Word (2 Byte) from stream (big ending) */
        readWordBE(offset) {
            if (offset == null)
                offset = this.pos;
            let v = (this.data[offset]) | (this.data[offset + 1] << 8);
            this.pos = offset + 2;
            return v;
        }
        /** Read a String */
        readString(length, offset) {
            if (offset === null)
                this.pos = offset + this.hiddenOffset;
            let result = "";
            for (let i = 0; i < length; i++) {
                let v = this.data[this.pos];
                this.pos++;
                result += String.fromCharCode(v);
            }
            return result;
        }
        /** return the current curser position */
        getOffset() {
            return this.pos - this.hiddenOffset;
        }
        /** set the current curser position */
        setOffset(newPos) {
            this.pos = newPos + this.hiddenOffset;
        }
        /** return true if the curserposition is out of data */
        eof() {
            let pos = this.pos - this.hiddenOffset;
            return ((pos >= this.length) || (pos < 0));
        }
        /** return a String of the data */
        readAll() {
            return this.readString(this.length, 0);
        }
    }
    Lemmings.BinaryReader = BinaryReader;
})(Lemmings || (Lemmings = {}));
/// <reference path="binary-reader.ts"/>
var Lemmings;
(function (Lemmings) {
    //------------------------
    // reads the bits on a BinaryReader
    class BitReader {
        constructor(fileReader, offset, length, initBufferLength) {
            this.pos = 0;
            //- create a copy of the reader
            this.binReader = new Lemmings.BinaryReader(fileReader, offset, length, fileReader.filename);
            this.pos = length;
            this.pos--;
            this.buffer = this.binReader.readByte(this.pos);
            this.bufferLen = initBufferLength;
            this.checksum = this.buffer;
        }
        getCurrentChecksum() {
            return this.checksum;
        }
        /** read and return [bitCount] bits from the stream */
        read(bitCount) {
            let result = 0;
            for (var i = bitCount; i > 0; i--) {
                if (this.bufferLen <= 0) {
                    this.pos--;
                    var b = this.binReader.readByte(this.pos);
                    this.buffer = b;
                    this.checksum ^= b;
                    this.bufferLen = 8;
                }
                this.bufferLen--;
                result = (result << 1) | (this.buffer & 1);
                this.buffer >>= 1;
            }
            return result;
        }
        eof() {
            return ((this.bufferLen <= 0) && (this.pos < 0));
        }
    }
    Lemmings.BitReader = BitReader;
})(Lemmings || (Lemmings = {}));
/// <reference path="bit-reader.ts"/>
/// <reference path="binary-reader.ts"/>
var Lemmings;
(function (Lemmings) {
    /** Bit Stream Writer class */
    class BitWriter {
        constructor(bitReader, outLength) {
            this.error = new Lemmings.ErrorHandler("BitWriter");
            this.outData = new Uint8Array(outLength);
            this.outPos = outLength;
            this.bitReader = bitReader;
        }
        /** copy lenght bytes from the reader */
        copyRawData(length) {
            if (this.outPos - length < 0) {
                this.error.log("copyRawData: out of out buffer");
                length = this.outPos;
                return;
            }
            for (; length > 0; length--) {
                this.outPos--;
                this.outData[this.outPos] = this.bitReader.read(8);
            }
        }
        /** Copy length bits from the write cache */
        copyReferencedData(length, offsetBitCount) {
            /// read offset to current write pointer to read from
            var offset = this.bitReader.read(offsetBitCount) + 1;
            /// is offset in range?
            if (this.outPos + offset > this.outData.length) {
                this.error.log("copyReferencedData: offset out of range");
                offset = 0;
                return;
            }
            /// is lenght in range
            if (this.outPos - length < 0) {
                this.error.log("copyReferencedData: out of out buffer");
                length = this.outPos;
                return;
            }
            for (; length > 0; length--) {
                this.outPos--;
                this.outData[this.outPos] = this.outData[this.outPos + offset];
            }
        }
        /** return a  BinaryReader with the data written to this BitWriter class */
        getFileReader(filename) {
            return new Lemmings.BinaryReader(this.outData, null, null, filename);
        }
        eof() {
            return this.outPos <= 0;
        }
    }
    Lemmings.BitWriter = BitWriter;
})(Lemmings || (Lemmings = {}));
/// <reference path="../error-handler.ts"/>
var Lemmings;
(function (Lemmings) {
    /** Read the container file and return the unpacked parts of it  */
    class FileContainer {
        /** read the content of the container  */
        constructor(content) {
            this.error = new Lemmings.ErrorHandler("FileContainer");
            this.read(content);
        }
        /** Unpack a part (chunks / segments) of the file and return it */
        getPart(index) {
            if ((index < 0) || (index >= this.parts.length)) {
                this.error.log("getPart(" + index + ") Out of index!");
                return new Lemmings.BinaryReader();
            }
            return this.parts[index].unpack();
        }
        /** return the number of parts in this file */
        count() {
            return this.parts.length;
        }
        /** do the read job and find all parts in this container */
        read(fileReader) {
            /// reset parts
            this.parts = new Array();
            /// we start at the end of the file
            var pos = 0;
            /// the size of the header
            const HEADER_SIZE = 10;
            while (pos + HEADER_SIZE < fileReader.length) {
                fileReader.setOffset(pos);
                let part = new Lemmings.UnpackFilePart(fileReader);
                /// start of the chunk
                part.offset = pos + HEADER_SIZE;
                /// Read Header of each Part
                part.initialBufferLen = fileReader.readByte();
                part.checksum = fileReader.readByte();
                part.unknown1 = fileReader.readWord();
                part.decompressedSize = fileReader.readWord();
                part.unknown0 = fileReader.readWord();
                var size = fileReader.readWord();
                part.compressedSize = size - HEADER_SIZE;
                /// position of this part in the container
                part.index = this.parts.length;
                /// check if the data are valid
                if ((part.offset < 0) || (size > 0xFFFFFF) || (size < 10)) {
                    this.error.log("out of sync " + fileReader.filename);
                    break;
                }
                //- add part
                this.parts.push(part);
                //this.error.debug(part);
                /// jump to next part
                pos += size;
            }
            this.error.debug(fileReader.filename + " has " + this.parts.length + " file-parts.");
        }
    }
    Lemmings.FileContainer = FileContainer;
})(Lemmings || (Lemmings = {}));
/// <reference path="binary-reader.ts"/>
/// <reference path="../error-handler.ts"/>
var Lemmings;
(function (Lemmings) {
    /**
    * Handle Files loading from remote/web
    */
    class FileProvider {
        constructor(rootPath) {
            this.rootPath = rootPath;
            this._errorHandler = new Lemmings.ErrorHandler("FileProvider");
        }
        /** load binary data from URL: rootPath + [path] + filename */
        loadBinary(path, filename = null) {
            let url = this.rootPath + path + ((filename == null) ? "" : "/" + filename);
            this._errorHandler.debug("loading:" + url);
            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        let reader = new Lemmings.BinaryReader(xhr.response, 0, null, this.filenameFormUrl(url));
                        resolve(reader);
                    }
                    else {
                        this._errorHandler.log("error load file:" + url);
                        reject({ status: xhr.status, statusText: xhr.statusText });
                    }
                };
                xhr.onerror = () => {
                    this._errorHandler.log("error load file:" + url);
                    reject({ status: xhr.status, statusText: xhr.statusText });
                };
                xhr.open("GET", url);
                xhr.responseType = "arraybuffer";
                xhr.send();
            });
        }
        /** load string data from URL */
        loadString(url) {
            this._errorHandler.log("Load file as string: " + url);
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.onload = (oEvent) => {
                    resolve(xhr.response);
                };
                xhr.onerror = () => {
                    this._errorHandler.log("error load file:" + url);
                    reject({ status: xhr.status, statusText: xhr.statusText });
                };
                /// setup query
                xhr.open('GET', url, true);
                xhr.responseType = "text";
                /// call url
                xhr.send(null);
            });
        }
        // Extract filename form URL
        filenameFormUrl(url) {
            if (url == "")
                return "";
            url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
            url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
            url = url.substring(url.lastIndexOf("/") + 1, url.length);
            return url;
        }
    }
    Lemmings.FileProvider = FileProvider;
})(Lemmings || (Lemmings = {}));
/// <reference path="../error-handler.ts"/>
var Lemmings;
(function (Lemmings) {
    /** represents a part/chunk of a file and is  */
    class UnpackFilePart {
        constructor(fileReader) {
            /** file offset in the container */
            this.offset = 0;
            /** flag for uncompressing */
            this.initialBufferLen = 0;
            /** checksum this file need to have */
            this.checksum = 0;
            /** size the uncompressed chunk should have */
            this.decompressedSize = 0;
            /** the size the compressed chunk had */
            this.compressedSize = 0;
            this.unknown0 = 0;
            this.unknown1 = 0;
            /** position of this part/chunk in the container */
            this.index = 0;
            this.error = new Lemmings.ErrorHandler("UnpackFilePart");
            this.fileReader = fileReader;
            this.unpackingDone = false;
        }
        /** unpack this content and return a BinaryReader */
        unpack() {
            /// if the unpacking is not yet done, do it...
            if (!this.unpackingDone) {
                this.fileReader = this.doUnpacking(this.fileReader);
                this.unpackingDone = true;
            }
            return this.fileReader;
        }
        /// unpack the fileReader
        doUnpacking(fileReader) {
            var bitReader = new Lemmings.BitReader(fileReader, this.offset, this.compressedSize, this.initialBufferLen);
            var outBuffer = new Lemmings.BitWriter(bitReader, this.decompressedSize);
            while ((!outBuffer.eof()) && (!bitReader.eof())) {
                if (bitReader.read(1) == 0) {
                    switch (bitReader.read(1)) {
                        case 0:
                            outBuffer.copyRawData(bitReader.read(3) + 1);
                            break;
                        case 1:
                            outBuffer.copyReferencedData(2, 8);
                            break;
                    }
                }
                else {
                    switch (bitReader.read(2)) {
                        case 0:
                            outBuffer.copyReferencedData(3, 9);
                            break;
                        case 1:
                            outBuffer.copyReferencedData(4, 10);
                            break;
                        case 2:
                            outBuffer.copyReferencedData(bitReader.read(8) + 1, 12);
                            break;
                        case 3:
                            outBuffer.copyRawData(bitReader.read(8) + 9);
                            break;
                    }
                }
            }
            if (this.checksum == bitReader.getCurrentChecksum()) {
                this.error.debug("doUnpacking(" + fileReader.filename + ") done! ");
            }
            else {
                this.error.log("doUnpacking(" + fileReader.filename + ") : Checksum mismatch! ");
            }
            /// create FileReader from buffer
            var outReader = outBuffer.getFileReader(fileReader.filename + "[" + this.index + "]");
            return outReader;
        }
    }
    Lemmings.UnpackFilePart = UnpackFilePart;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** The ColorPallet Class provides a Collor Pallet of the game.
     *  use:
     *                           INDEX   RGBA
     * read:  ColorPallet.data[0 ... 16][0..3];
     * write: ColorPallet.setColor(INT index, INT r, INT g, INT b, BOOL locked)
     */
    class ColorPallet {
        constructor() {
            this.data = new Array(16); //- 16 colors
            this.isColorLock = new Int8Array(16);
        }
        //- locked colors are only changed if locked==true
        setColorInt(index, colorValue, locked = false) {
            let r = (colorValue >>> 16) & 0xFF;
            let g = (colorValue >>> 8) & 0xFF;
            let b = (colorValue) & 0xFF;
            this.setColorRGB(index, r, g, b, locked);
        }
        //- locked colors are only changed if locked==true
        setColorRGB(index, r, g, b, locked = false) {
            var color = new Uint8Array(4);
            //- if the color is locked we do not overwrite it.
            if ((this.isColorLock[index] != 0) && (!locked))
                return;
            color[0] = r;
            color[1] = g;
            color[2] = b;
            color[3] = 255;
            this.data[index] = color;
            this.isColorLock[index] = locked ? 1 : 0;
        }
        /** init with locked colors that can't be changed */
        initLockedValues() {
            this.setColorInt(0, 0x000000, true); // balck
            this.setColorInt(1, 0x4040e0, true); // blue: Lemmings Body
            this.setColorInt(2, 0x00b000, true); // green: Lemmings haar
            this.setColorInt(3, 0xf3d3d3, true); // white: Lemmings skin / Letters 
            this.setColorInt(4, 0xb2b200, true); // yellow
            this.setColorInt(5, 0xf32020, true); // dark red
            this.setColorInt(6, 0x828282, true); // gray
            this.setColorInt(7, 0xe08020); // this color is set by the level
        }
    }
    Lemmings.ColorPallet = ColorPallet;
})(Lemmings || (Lemmings = {}));
/// <reference path="../file/binary-reader.ts"/>
/// <reference path="../error-handler.ts"/>
/// <reference path="./color-pallet.ts"/>
var Lemmings;
(function (Lemmings) {
    /** base image information of objects */
    class BaseImageInfo {
        constructor() {
            this.width = 0;
            this.height = 0;
            /// normale case
            ///           +------------+
            /// imageLoc: |            | 1st Bits
            ///           |            | 2th Bits
            /// vgaLoc:   |            | 3th Bits
            /// maskLoc:  |            | 4th Bits
            ///           +------------+
            /** position of the image in the file */
            this.imageLoc = 0;
            /** position of the (alpha) mask in the file */
            this.maskLoc = 0;
            /** position of the vga bits in the file */
            this.vgaLoc = 0;
            /** size of one frame in the file */
            this.frameDataSize = 0;
            /** number of frames used by this image */
            this.frameCount = 0;
            /** the color pallete to be used for this image */
            this.pallet = null;
        }
    }
    Lemmings.BaseImageInfo = BaseImageInfo;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** convert the lemmings bit plain image format to real image data.
     * The lemmings file format uses multiple plains for every bit of color.
     * E.g. Save all lowest bits of the image in a chunk then all second bits... */
    class BitPlainImage {
        constructor(reader, width, height) {
            this.reader = reader;
            this.width = width;
            this.height = height;
            let pixCount = this.width * this.height;
            this.pixBuf = new Uint8Array(pixCount);
        }
        /** return the image buffer */
        getImageBuffer() {
            return this.pixBuf;
        }
        /** convert the multi-bit-plain image to image */
        processImage(startPos = 0) {
            let src = this.reader;
            let pixBuf = this.pixBuf;
            let pixCount = pixBuf.length;
            let bitBufLen = 0;
            let bitBuf = 0;
            /// read image
            src.setOffset(startPos);
            //-  3 bit per Pixel - bits of byte are stored separately
            for (var i = 0; i < 3; i++) {
                for (var p = 0; p < pixCount; p++) {
                    if (bitBufLen <= 0) {
                        bitBuf = src.readByte();
                        bitBufLen = 8;
                    }
                    pixBuf[p] = pixBuf[p] | ((bitBuf & 0x80) >> (7 - i));
                    bitBuf = (bitBuf << 1);
                    bitBufLen--;
                }
            }
            this.pixBuf = pixBuf;
        }
        /** use a color-index for the transparency in the image */
        processTransparentByColorIndex(transparentColorIndex) {
            let pixBuf = this.pixBuf;
            let pixCount = pixBuf.length;
            for (let i = 0; i < pixCount; i++) {
                if (pixBuf[i] == transparentColorIndex) {
                    /// Sets the highest bit to indicate the transparency.
                    pixBuf[i] = 0x80 | pixBuf[i];
                }
            }
            this.pixBuf = pixBuf;
        }
        /** use a bit plain for the transparency in the image */
        processTransparentData(startPos = 0) {
            let src = this.reader;
            let pixBuf = this.pixBuf;
            let pixCount = pixBuf.length;
            let bitBufLen = 0;
            let bitBuf = 0;
            /// read image mask
            src.setOffset(startPos);
            for (var p = 0; p < pixCount; p++) {
                if (bitBufLen <= 0) {
                    bitBuf = src.readByte();
                    bitBufLen = 8;
                }
                if ((bitBuf & 0x80) == 0) {
                    /// Sets the highest bit to indicate the transparency.
                    pixBuf[p] = 0x80 | pixBuf[p];
                }
                bitBuf = (bitBuf << 1);
                bitBufLen--;
            }
            this.pixBuf = pixBuf;
        }
    }
    Lemmings.BitPlainImage = BitPlainImage;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** store a ground image */
    class GroundImage {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.imgData = new Uint8ClampedArray(width * height * 4);
            this.imgMask = new Int8Array(width * height);
        }
        /** set the image to color=black / alpha=1 */
        clearImageArray() {
            var buffer32 = new Uint32Array(this.imgData.buffer);
            let len = buffer32.length;
            while (len--)
                /// set r,g,b = 0 and alpha=FF
                buffer32[len] = 0xFF000000;
            /// for debugging
            //buffer32[len] = 0xFFCBC0FF;
        }
        drawPalettImage(srcImg, srcWidth, srcHeight, pallet, left, top) {
            let pixIndex = 0;
            for (let y = 0; y < srcHeight; y++) {
                for (let x = 0; x < srcWidth; x++) {
                    let colorIndex = srcImg[pixIndex];
                    pixIndex++;
                    if ((colorIndex & 0x80) > 0) {
                        //this.setPixel(x+left, y+top, pallet.data[2]);
                        this.clearPixel(x + left, y + top);
                    }
                    else {
                        this.setPixel(x + left, y + top, pallet.data[colorIndex]);
                    }
                }
            }
        }
        /** set the color of a pixle */
        setPixel(x, y, color, noOverwrite = false, onlyOverwrite = false) {
            if ((x < 0) || (x >= this.width))
                return;
            if ((y < 0) || (y >= this.height))
                return;
            var destPixelPos = y * this.width + x;
            if (noOverwrite) {
                /// if some data have been drawn here before
                if (this.imgMask[destPixelPos] != 0)
                    return;
            }
            if (onlyOverwrite) {
                /// if no data have been drawn here before
                if (this.imgMask[destPixelPos] == 0)
                    return;
            }
            var i = destPixelPos * 4;
            this.imgData[i + 0] = color[0]; //- R
            this.imgData[i + 1] = color[1]; //- G
            this.imgData[i + 2] = color[2]; //- B
            this.imgMask[destPixelPos] = 1;
        }
        /** set a pixle to back */
        clearPixel(x, y) {
            if ((x < 0) || (x >= this.width))
                return;
            if ((y < 0) || (y >= this.height))
                return;
            var destPixelPos = y * this.width + x;
            var i = destPixelPos * 4;
            this.imgData[i + 0] = 0; //- R
            this.imgData[i + 1] = 0; //- G
            this.imgData[i + 2] = 0; //- B
            this.imgMask[destPixelPos] = 0;
        }
    }
    Lemmings.GroundImage = GroundImage;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** Define Types a triggers */
    var TriggerTypes;
    (function (TriggerTypes) {
        TriggerTypes[TriggerTypes["NO_TRIGGER"] = 0] = "NO_TRIGGER";
        TriggerTypes[TriggerTypes["EXIT_LEVEL"] = 1] = "EXIT_LEVEL";
        TriggerTypes[TriggerTypes["UNKNOWN_2"] = 2] = "UNKNOWN_2";
        TriggerTypes[TriggerTypes["UNKNOWN_3"] = 3] = "UNKNOWN_3";
        TriggerTypes[TriggerTypes["TRAP"] = 4] = "TRAP";
        TriggerTypes[TriggerTypes["DROWN"] = 5] = "DROWN";
        TriggerTypes[TriggerTypes["KILL"] = 6] = "KILL";
        TriggerTypes[TriggerTypes["ONWAY_LEFT"] = 7] = "ONWAY_LEFT";
        TriggerTypes[TriggerTypes["ONWAY_RIGHT"] = 8] = "ONWAY_RIGHT";
        TriggerTypes[TriggerTypes["STEEL"] = 9] = "STEEL";
    })(TriggerTypes = Lemmings.TriggerTypes || (Lemmings.TriggerTypes = {}));
})(Lemmings || (Lemmings = {}));
/// <reference path="./base-image-info.ts"/>
/// <reference path="./trigger-types.ts"/>
var Lemmings;
(function (Lemmings) {
    /** stores sprite image properties of objects */
    class ObjectImageInfo extends Lemmings.BaseImageInfo {
        constructor() {
            super(...arguments);
            this.animationLoop = false;
            this.firstFrameIndex = 0;
            this.unknown1 = 0;
            this.unknown2 = 0;
            this.trigger_left = 0;
            this.trigger_top = 0;
            this.trigger_width = 0;
            this.trigger_height = 0;
            this.trigger_effect_id = 0;
            this.preview_image_index = 0;
            this.unknown = 0;
            this.trap_sound_effect_id = 0;
        }
    }
    Lemmings.ObjectImageInfo = ObjectImageInfo;
})(Lemmings || (Lemmings = {}));
/// <reference path="./base-image-info.ts"/>
var Lemmings;
(function (Lemmings) {
    /** stores terrain/background image properties */
    class TerrainImageInfo extends Lemmings.BaseImageInfo {
    }
    Lemmings.TerrainImageInfo = TerrainImageInfo;
})(Lemmings || (Lemmings = {}));
/// <reference path="../file/binary-reader.ts"/>
/// <reference path="../error-handler.ts"/>
/// <reference path="./color-pallet.ts"/>
/// <reference path="./object-image-info.ts"/>
/// <reference path="./terrain-image-info.ts"/>
var Lemmings;
(function (Lemmings) {
    /** access to ground file (GROUNDxO.DAT)
     * The Ground file
    */
    class GroundReader {
        constructor(groundFile, vgaObject, vgaTerrar) {
            this.imgObjects = new Array(16);
            this.imgTerrar = new Array(64);
            /** the color palette stored in this file */
            this.groundPallet = new Lemmings.ColorPallet();
            this.colorPallet = new Lemmings.ColorPallet();
            this.previewPallet = new Lemmings.ColorPallet();
            this.error = new Lemmings.ErrorHandler("GroundReader");
            if (groundFile.length != 1056) {
                this.error.log("groundFile " + groundFile.filename + " has wrong size: " + groundFile.length);
                return;
            }
            let BYTE_SIZE_OF_OBJECTS = 28 * 16;
            let BYTE_SIZE_OF_TERRAIN = 64 * 8;
            this.readPalettes(groundFile, BYTE_SIZE_OF_OBJECTS + BYTE_SIZE_OF_TERRAIN);
            this.readObjectImages(groundFile, 0, this.colorPallet);
            this.readTerrainImages(groundFile, BYTE_SIZE_OF_OBJECTS, this.groundPallet);
            this.readImages(this.imgObjects, vgaObject);
            this.readImages(this.imgTerrar, vgaTerrar);
        }
        /** load the images from the VGAG file to the Image Objects in the List */
        readImages(imgList, vga) {
            imgList.map((img) => {
                let bitBuf = 0;
                let bitBufLen = 0;
                img.frames = [];
                let filePos = img.imageLoc;
                for (let f = 0; f < img.frameCount; f++) {
                    var bitImage = new Lemmings.BitPlainImage(vga, img.width, img.height);
                    bitImage.processImage(filePos);
                    bitImage.processTransparentData(img.maskLoc);
                    img.frames.push(bitImage.getImageBuffer());
                    /// move to the next frame data
                    filePos += img.frameDataSize;
                }
            });
        }
        /** loads the properties for object-images  */
        readObjectImages(frO, offset, colorPalett) {
            /// read the object from 
            frO.setOffset(offset);
            for (let i = 0; i < 16; i++) {
                let img = new Lemmings.ObjectImageInfo();
                let flags = frO.readWordBE();
                img.animationLoop = ((flags & 1) == 0);
                img.firstFrameIndex = frO.readByte();
                img.frameCount = frO.readByte();
                img.width = frO.readByte();
                img.height = frO.readByte();
                img.frameDataSize = frO.readWordBE();
                img.maskLoc = frO.readWordBE();
                img.unknown1 = frO.readWordBE();
                img.unknown2 = frO.readWordBE();
                img.trigger_left = frO.readWordBE() * 4;
                img.trigger_top = frO.readWordBE() * 4 - 4;
                img.trigger_width = frO.readByte() * 4;
                img.trigger_height = frO.readByte() * 4;
                img.trigger_effect_id = frO.readByte();
                img.imageLoc = frO.readWordBE();
                img.preview_image_index = frO.readWordBE();
                img.unknown = frO.readWordBE();
                img.trap_sound_effect_id = frO.readByte();
                img.pallet = colorPalett;
                if (frO.eof()) {
                    this.error.log("readObjectImages() : unexpected end of file: " + frO.filename);
                    return;
                }
                //- add Object
                this.imgObjects[i] = img;
            }
        }
        /** loads the properties for terrain-images  */
        readTerrainImages(frO, offset, colorPallet) {
            frO.setOffset(offset);
            for (let i = 0; i < 64; i++) {
                let img = new Lemmings.TerrainImageInfo();
                img.width = frO.readByte();
                img.height = frO.readByte();
                img.imageLoc = frO.readWordBE();
                img.maskLoc = frO.readWordBE();
                img.vgaLoc = frO.readWordBE();
                img.pallet = colorPallet;
                img.frameCount = 1;
                if (frO.eof()) {
                    this.error.log("readTerrainImages() : unexpected end of file! " + frO.filename);
                    return;
                }
                //- add Object
                this.imgTerrar[i] = img;
            }
        }
        /** loads the palettes  */
        readPalettes(frO, offset) {
            /// jump over the EGA palettes
            frO.setOffset(offset + 3 * 8);
            this.colorPallet.initLockedValues();
            this.previewPallet.initLockedValues();
            this.groundPallet;
            /// read the VGA palette index 8..15
            for (let i = 0; i < 8; i++) {
                let r = frO.readByte() << 2;
                let g = frO.readByte() << 2;
                let b = frO.readByte() << 2;
                this.groundPallet.setColorRGB(i, r, g, b);
            }
            /// read the VGA palette index 0..7
            for (var i = 0; i < 8; i++) {
                let r = frO.readByte() << 2;
                let g = frO.readByte() << 2;
                let b = frO.readByte() << 2;
                this.previewPallet.setColorRGB(i, r, g, b);
                this.colorPallet.setColorRGB(i, r, g, b);
            }
            /// read the VGA palette index 8..15 for preview
            for (let i = 8; i < 16; i++) {
                let r = frO.readByte() << 2;
                let g = frO.readByte() << 2;
                let b = frO.readByte() << 2;
                this.previewPallet.setColorRGB(i, r, g, b);
            }
            if (frO.eof()) {
                this.error.log("readPalettes() : unexpected end of file!: " + frO.filename);
                return;
            }
        }
    }
    Lemmings.GroundReader = GroundReader;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** A LevelElement is a Object / Terrain Item used on a Level map */
    class LevelElement {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.id = 0;
            this.frameIndex = 0;
            this.isUpsideDown = false;
            this.noOverwrite = false;
            this.onlyOverwrite = false;
            this.isErase = false;
        }
    }
    Lemmings.LevelElement = LevelElement;
})(Lemmings || (Lemmings = {}));
/// <reference path="../../skill-types.ts"/>
var Lemmings;
(function (Lemmings) {
    class LevelProperties {
        constructor() {
            this.levelName = "";
            this.releaseRate = 0;
            this.releaseCount = 0;
            this.needCount = 0;
            this.timeLimit = 0;
            this.skills = new Array(Lemmings.SkillTypes.length());
        }
    }
    Lemmings.LevelProperties = LevelProperties;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** stores a rectangle range */
    class Range {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        }
    }
    Lemmings.Range = Range;
})(Lemmings || (Lemmings = {}));
/// <reference path="../file/binary-reader.ts"/>
/// <reference path="../../skill-types.ts"/>
/// <reference path="./range.ts"/>
/// <reference path="./level-properties.ts"/>
var Lemmings;
(function (Lemmings) {
    /** read a level from LEVEL___.DAT file */
    class LevelReader {
        /// Load a Level
        constructor(fr) {
            this.levelWidth = 1600;
            this.levelHeight = 160;
            this.levelProperties = new Lemmings.LevelProperties();
            this.screenPositionX = 0;
            /** index of GROUNDxO.DAT file */
            this.graphicSet1 = 0;
            /** index of VGASPECx.DAT */
            this.graphicSet2 = 0;
            this.isSuperLemming = false;
            this.objects = [];
            this.terrains = [];
            this.steel = [];
            this.error = new Lemmings.ErrorHandler("LevelReader");
            this.readLevelInfo(fr);
            this.readLevelObjects(fr);
            this.readLevelTerrain(fr);
            this.readSteelArea(fr);
            this.readLevelName(fr);
            this.error.debug(this);
        }
        /** read general Level information */
        readLevelInfo(fr) {
            fr.setOffset(0);
            this.levelProperties.releaseRate = fr.readWord();
            this.levelProperties.releaseCount = fr.readWord();
            this.levelProperties.needCount = fr.readWord();
            this.levelProperties.timeLimit = fr.readWord();
            //- read amount of skills
            this.levelProperties.skills[Lemmings.SkillTypes.CLIMBER] = fr.readWord();
            this.levelProperties.skills[Lemmings.SkillTypes.FLOATER] = fr.readWord();
            this.levelProperties.skills[Lemmings.SkillTypes.BOMBER] = fr.readWord();
            this.levelProperties.skills[Lemmings.SkillTypes.BLOCKER] = fr.readWord();
            this.levelProperties.skills[Lemmings.SkillTypes.BUILDER] = fr.readWord();
            this.levelProperties.skills[Lemmings.SkillTypes.BASHER] = fr.readWord();
            this.levelProperties.skills[Lemmings.SkillTypes.MINER] = fr.readWord();
            this.levelProperties.skills[Lemmings.SkillTypes.DIGGER] = fr.readWord();
            this.screenPositionX = fr.readWord();
            this.graphicSet1 = fr.readWord();
            this.graphicSet2 = fr.readWord();
            this.isSuperLemming = (fr.readWord() != 0);
        }
        /** read the Level Obejcts */
        readLevelObjects(fr) {
            /// reset array
            this.objects = [];
            fr.setOffset(0x0020);
            for (var i = 0; i < 32; i++) {
                var newOb = new Lemmings.LevelElement();
                newOb.x = fr.readWord() - 16;
                newOb.y = fr.readWord();
                newOb.id = fr.readWord();
                var flags = fr.readWord();
                newOb.isUpsideDown = ((flags & 0x0080) > 0);
                newOb.noOverwrite = ((flags & 0x8000) > 0);
                newOb.onlyOverwrite = ((flags & 0x4000) > 0);
                if (flags == 0)
                    continue;
                this.objects.push(newOb);
            }
        }
        /** read the Level Obejcts */
        readLevelTerrain(fr) {
            /// reset array
            this.terrains = [];
            fr.setOffset(0x0120);
            for (var i = 0; i < 400; i++) {
                var newOb = new Lemmings.LevelElement();
                var v = fr.readInt(4);
                if (v == -1)
                    continue;
                newOb.x = ((v >> 16) & 0x0FFF) - 16;
                var y = ((v >> 7) & 0x01FF);
                newOb.y = y - ((y > 256) ? 516 : 4);
                newOb.id = (v & 0x003F);
                var flags = ((v >> 29) & 0x000F);
                newOb.isUpsideDown = ((flags & 2) > 0);
                newOb.noOverwrite = ((flags & 4) > 0);
                newOb.isErase = ((flags & 1) > 0);
                //- the original game does not allow the combination: (noOverwrite | isErase)
                if (newOb.noOverwrite)
                    newOb.isErase = false;
                this.terrains.push(newOb);
            }
        }
        /** read Level Steel areas (Lemming can't pass) */
        readSteelArea(fr) {
            /// reset array
            this.steel = [];
            fr.setOffset(0x0760);
            for (var i = 0; i < 32; i++) {
                var newRange = new Lemmings.Range();
                var pos = fr.readWord();
                var size = fr.readByte();
                var unknown = fr.readByte();
                if ((pos == 0) && (size == 0))
                    continue;
                if (unknown != 0) {
                    this.error.log("Error in readSteelArea() : unknown != 0");
                    continue;
                }
                newRange.x = (pos & 0x01FF) * 4 - 16;
                newRange.y = ((pos >> 9) & 0x007F) * 4;
                newRange.width = (size & 0x0F) * 4 + 4;
                newRange.height = ((size >> 4) & 0x0F) * 4 + 4;
                this.steel.push(newRange);
            }
        }
        /** read general Level information */
        readLevelName(fr) {
            /// at the end of the 
            this.levelProperties.levelName = fr.readString(32, 0x07E0);
            this.error.debug("Level Name: " + this.levelProperties.levelName);
        }
    }
    Lemmings.LevelReader = LevelReader;
})(Lemmings || (Lemmings = {}));
/// <reference path="../file/binary-reader.ts" />
/// <reference path="../file/file-container.ts" />
/// <reference path="../../skill-types.ts"/>
var Lemmings;
(function (Lemmings) {
    /** The Odd Table has a list of LevelProperties to describe alternative starting conditions for a level  */
    class OddTableReader {
        constructor(oddfile) {
            this.levelProperties = [];
            this.error = new Lemmings.ErrorHandler("OddTableReader");
            this.read(oddfile);
        }
        /** return the Level for a given levelNumber - LevelNumber is counting all levels from first to last of the game
         *  Odd-Tables are only used for the "Original Lemmings" Game
         */
        getLevelProperties(levelNumber) {
            if ((levelNumber >= this.levelProperties.length) && (levelNumber < 0))
                return null;
            return this.levelProperties[levelNumber];
        }
        /** read the odd fine */
        read(fr) {
            fr.setOffset(0);
            let count = Math.floor(fr.length / 56);
            for (let i = 0; i < count; i++) {
                let prop = new Lemmings.LevelProperties();
                prop.releaseRate = fr.readWord();
                prop.releaseCount = fr.readWord();
                prop.needCount = fr.readWord();
                prop.timeLimit = fr.readWord();
                //- read amount of skills
                prop.skills[Lemmings.SkillTypes.CLIMBER] = fr.readWord();
                prop.skills[Lemmings.SkillTypes.FLOATER] = fr.readWord();
                prop.skills[Lemmings.SkillTypes.BOMBER] = fr.readWord();
                prop.skills[Lemmings.SkillTypes.BLOCKER] = fr.readWord();
                prop.skills[Lemmings.SkillTypes.BUILDER] = fr.readWord();
                prop.skills[Lemmings.SkillTypes.BASHER] = fr.readWord();
                prop.skills[Lemmings.SkillTypes.MINER] = fr.readWord();
                prop.skills[Lemmings.SkillTypes.DIGGER] = fr.readWord();
                prop.levelName = fr.readString(32);
                this.error.debug("Level (" + i + ") Name: " + prop.levelName + " " + prop.needCount + " " + prop.timeLimit);
                this.levelProperties.push(prop);
            }
            this.error.debug("levelProperties: " + this.levelProperties.length);
        }
    }
    Lemmings.OddTableReader = OddTableReader;
})(Lemmings || (Lemmings = {}));
/// <reference path="../file/binary-reader.ts" />
/// <reference path="../file/file-container.ts" />
var Lemmings;
(function (Lemmings) {
    /** read the VGASPECx.DAT file : it is a image used for the ground */
    class VgaspecReader {
        constructor(vgaspecFile) {
            this.levelProperties = [];
            this.error = new Lemmings.ErrorHandler("VgaspecReader");
            /** the color palette stored in this file */
            this.groundPallet = new Lemmings.ColorPallet();
            this.read(vgaspecFile);
        }
        read(fr) {
            fr.setOffset(0);
            let fc = new Lemmings.FileContainer(fr);
            if (fc.count() != 1) {
                this.error.log("No FileContainer found!");
                return;
            }
            /// we only need the first part
            fr = fc.getPart(0);
            /// read palette
            this.readPalletes(fr, 0);
            /// process the image
            this.readImage(fr, 40);
        }
        readImage(fr, offset) {
            fr.setOffset(offset);
            let width = 960;
            let chunkHeight = 40;
            let chunkCount = 4;
            this.img = new Lemmings.GroundImage(width, chunkHeight * chunkCount);
            this.img.clearImageArray();
            let startScanLine = 0;
            let pixelCount = width * chunkHeight;
            let bitBuffer = new Uint8Array(pixelCount);
            let bitBufferPos = 0;
            while (!fr.eof()) {
                let curByte = fr.readByte();
                if (curByte == 128) {
                    /// end of chunk
                    /// unpack image data to image-buffer
                    var bitImage = new Lemmings.BitPlainImage(new Lemmings.BinaryReader(bitBuffer), width, chunkHeight);
                    bitImage.processImage(0);
                    bitImage.processTransparentByColorIndex(0);
                    this.img.drawPalettImage(bitImage.getImageBuffer(), width, chunkHeight, this.groundPallet, 0, startScanLine);
                    startScanLine += 40;
                    if (startScanLine >= this.img.height)
                        return;
                    bitBufferPos = 0;
                }
                else if (curByte <= 127) {
                    let copyByteCount = curByte + 1;
                    /// copy copyByteCount to the bitImage
                    while (!fr.eof()) {
                        /// write the next Byte
                        if (bitBufferPos >= bitBuffer.length)
                            return;
                        bitBuffer[bitBufferPos] = fr.readByte();
                        bitBufferPos++;
                        copyByteCount--;
                        if (copyByteCount <= 0)
                            break;
                    }
                }
                else {
                    /// copy n times the same value
                    let repeatByte = fr.readByte();
                    for (let repeatByteCount = 257 - curByte; repeatByteCount > 0; repeatByteCount--) {
                        /// write the next Byte
                        if (bitBufferPos >= bitBuffer.length)
                            return;
                        bitBuffer[bitBufferPos] = repeatByte;
                        bitBufferPos++;
                    }
                }
            }
        }
        /** loads the palettes  */
        readPalletes(fr, offset) {
            /// read the VGA palette index 0..8
            for (let i = 0; i < 8; i++) {
                let r = fr.readByte() << 2;
                let g = fr.readByte() << 2;
                let b = fr.readByte() << 2;
                this.groundPallet.setColorRGB(i, r, g, b);
            }
            if (fr.eof()) {
                this.error.log("readPalettes() : unexpected end of file!: " + fr.filename);
                return;
            }
        }
    }
    Lemmings.VgaspecReader = VgaspecReader;
})(Lemmings || (Lemmings = {}));
/// <reference path="../file/binary-reader.ts"/>
var Lemmings;
(function (Lemmings) {
    /** Class to read the Lemmings Sound Image File */
    class SoundImageManager {
        constructor(data, audioConfig) {
            this.data = data;
            this.fileConfig = audioConfig;
        }
        /** create a AdlibPlyer for a given music track number/index [0..N] */
        getMusicTrack(trackIndex) {
            var player = new Lemmings.SoundImagePlayer(this.data, this.fileConfig);
            player.initMusic(trackIndex);
            return player;
        }
        /** create a AdlibPlyer for a given sound index [0..N] */
        getSoundTrack(soundIndex) {
            var player = new Lemmings.SoundImagePlayer(this.data, this.fileConfig);
            player.initSound(soundIndex);
            return player;
        }
    }
    Lemmings.SoundImageManager = SoundImageManager;
})(Lemmings || (Lemmings = {}));
/// <reference path="../file/binary-reader.ts"/>
/// <reference path="sound-image-manager.ts"/>
var Lemmings;
(function (Lemmings) {
    var SoundImagChannelState;
    (function (SoundImagChannelState) {
        SoundImagChannelState[SoundImagChannelState["NONE"] = 0] = "NONE";
        SoundImagChannelState[SoundImagChannelState["SOUND"] = 1] = "SOUND";
        SoundImagChannelState[SoundImagChannelState["MUSIC"] = 2] = "MUSIC";
    })(SoundImagChannelState || (SoundImagChannelState = {}));
    /** interpreter for a channel of a song from a sound image file
     *  by calling 'read' its state is changes by procesing commands
     *  and as result OPL3 command are returned */
    class SoundImageChannels {
        constructor(reader, audioConfig) {
            this.waitTime = 0;
            this.waitSum = 0;
            this.programPointer = 0;
            this.channelPosition = 0;
            this.di00h = 0;
            this.di02h = 0;
            this.di04h = 0;
            this.di05h_h = 0;
            this.di05h_l = 0;
            this.di07h = 0;
            this.di08h_l = 0;
            this.di08h_h = 0;
            this.di0Fh = 0;
            this.di12h = 0;
            this.di13h = 0;
            this.unused = 0;
            /** only play if this is true */
            this.playingState = SoundImagChannelState.NONE;
            this.error = new Lemmings.ErrorHandler("AdliChannels");
            this.fileConfig = audioConfig;
            this.reader = new Lemmings.BinaryReader(reader);
        }
        /** read the channel data and write it to the callback */
        read(commandCallback) {
            if (this.playingState == SoundImagChannelState.NONE)
                return;
            this.waitTime--;
            let saveChannelPosition = this.channelPosition;
            if (this.waitTime <= 0) {
                if (this.soundImageVersion == 1) {
                    this.readBarVersion1(commandCallback);
                }
                else {
                    this.readBarVersion2(commandCallback);
                }
                return;
            }
            if (this.di13h != 0) {
                this.di00h = this.di00h + this.di13h;
                this.setFrequency(commandCallback);
            }
            if (this.reader.readByte(saveChannelPosition) != 0x82) {
                if (this.reader.readByte(this.di02h + 0xE) == this.waitTime) {
                    commandCallback(this.di08h_l, this.di08h_h);
                    this.di13h = 0;
                }
            }
        }
        readBarVersion1(commandCallback) {
            var cmdPos = this.channelPosition;
            while (true) {
                var cmd = this.reader.readByte(cmdPos);
                cmdPos++;
                if ((cmd & 0x80) == 0) {
                    this.setFrequencyHigh(commandCallback, cmd);
                    this.channelPosition = cmdPos;
                    return;
                }
                else if ((cmd >= 0xE0)) {
                    this.waitSum = (cmd - 0xDF);
                }
                else if ((cmd >= 0xC0)) {
                    this.setEnvelope(commandCallback, cmd - 0xC0);
                }
                else if ((cmd <= 0xB0)) {
                    cmdPos = this.part3(commandCallback, cmd, cmdPos);
                    if (cmdPos < 0)
                        return;
                }
                else {
                    this.setLevel(commandCallback, cmdPos);
                    cmdPos++;
                }
            }
        }
        readBarVersion2(commandCallback) {
            var cmdPos = this.channelPosition;
            while (true) {
                var cmd = this.reader.readByte(cmdPos);
                cmdPos++;
                if ((cmd & 0x80) == 0) {
                    this.setFrequencyHigh(commandCallback, cmd);
                    this.channelPosition = cmdPos;
                    return;
                }
                else if ((cmd >= 0xE0)) {
                    this.waitSum = (cmd - 0xDF);
                }
                else if ((cmd <= 0xA0)) {
                    cmdPos = this.part3(commandCallback, cmd, cmdPos);
                    if (cmdPos < 0)
                        return;
                }
                else {
                    this.setEnvelope(commandCallback, cmd - 0xA0);
                }
            }
        }
        setFrequencyHigh(commandCallback, cmd) {
            this.di00h = cmd;
            commandCallback(this.di08h_l, this.di08h_h);
            this.setFrequency(commandCallback);
            this.waitTime = this.waitSum;
        }
        setFrequency(commandCallback) {
            var mainPos = ((this.di00h + this.di12h) & 0xFF) + 4;
            var octave = this.reader.readByte(mainPos + this.fileConfig.octavesOffset);
            var frequenciesCount = this.reader.readByte(mainPos + this.fileConfig.frequenciesCountOffset);
            var frequency = this.reader.readWordBE(this.fileConfig.frequenciesOffset + frequenciesCount * 32);
            if ((frequency & 0x8000) == 0) {
                octave--;
            }
            if ((octave & 0x80) > 0) {
                octave++;
                frequency = frequency << 1; // * 2
            }
            /// write low part of frequency
            commandCallback(this.di07h + 0xA0, frequency & 0xFF);
            /// 0x3 : mask F-Number most sig.
            this.di08h_h = ((frequency >> 8) & 0x3) | ((octave << 2) & 0xFF);
            this.di08h_l = this.di07h + 0xB0;
            /// write high part of frequency
            /// 0x20 = set Key On
            commandCallback(this.di08h_l, this.di08h_h | 0x20);
        }
        setEnvelope(commandCallback, cmd) {
            var value;
            this.di04h = cmd;
            var pos = this.instrumentPos;
            if (this.playingState == SoundImagChannelState.SOUND) {
                pos = this.fileConfig.soundDataOffset;
            }
            pos = pos + ((cmd - 1) << 4);
            /// Attack Rate / Decay Rate
            value = this.reader.readByte(pos + 0);
            commandCallback(this.di05h_l + 0x60, value);
            value = this.reader.readByte(pos + 1);
            commandCallback(this.di05h_h + 0x60, value);
            /// Sustain Level / Release Rate
            value = this.reader.readByte(pos + 2);
            commandCallback(this.di05h_l + 0x80, value);
            value = this.reader.readByte(pos + 3);
            commandCallback(this.di05h_h + 0x80, value);
            /// Waveform Select
            value = this.reader.readByte(pos + 6);
            commandCallback(this.di05h_l + 0xE0, value);
            value = this.reader.readByte(pos + 7);
            commandCallback(this.di05h_h + 0xE0, value);
            /// 0xC0 -'
            value = this.reader.readByte(pos + 9);
            commandCallback(this.di07h + 0xC0, value);
            /// 0x20 -'
            value = this.reader.readByte(pos + 4);
            commandCallback(this.di05h_l + 0x20, value);
            value = this.reader.readByte(pos + 5);
            commandCallback(this.di05h_h + 0x20, value);
            /// other
            this.di12h = this.reader.readByte(pos + 8);
            this.di0Fh = this.reader.readByte(pos + 11);
            this.di02h = pos;
            this.setLevel(commandCallback, pos + 10);
        }
        part3(commandCallback, cmd, cmdPos) {
            switch (cmd & 0xF) {
                case 0:
                    var tmpPos = this.programPointer;
                    var cx = this.reader.readWordBE(tmpPos);
                    tmpPos += 2;
                    if (cx == 0) {
                        tmpPos = this.reader.readWordBE(tmpPos) + this.fileConfig.instructionsOffset;
                        cmdPos = this.reader.readWordBE(tmpPos) + this.fileConfig.instructionsOffset;
                        tmpPos += 2;
                    }
                    else {
                        cmdPos = cx + this.fileConfig.instructionsOffset;
                    }
                    this.programPointer = tmpPos;
                    this.channelPosition = cmdPos;
                    break;
                case 1:
                    /// Set frequency
                    commandCallback(this.di08h_l, this.di08h_h);
                    this.di13h = 0;
                    this.channelPosition = cmdPos;
                    this.waitTime = this.waitSum;
                    return -1;
                case 2:
                    this.channelPosition = cmdPos;
                    this.waitTime = this.waitSum;
                    return -1;
                case 3:
                    this.error.log("not implemented - end of song");
                    // Todo: 
                    ///-- reset all chanels ----
                    /*
                    for (var i:number = 0; i< this.channelCount; i++) {
          
                      commandCallback(this.di08h_l, this.di08h_h);
                      
                      this.playingState = AdliChannelsPlayingType.NONE;
                    }
          
                    */
                    return -1;
                case 4:
                    this.di12h = this.reader.readByte(cmdPos);
                    cmdPos++;
                    break;
                case 5:
                    commandCallback(this.di08h_l, this.di08h_h);
                    this.playingState = SoundImagChannelState.NONE;
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
        setLevel(commandCallback, cmdPos) {
            var pos = this.reader.readByte(cmdPos);
            var ah = this.reader.readByte((pos & 0x7F) + this.fileConfig.dataOffset);
            var al = this.reader.readByte(this.di02h + 0xC);
            al = (al << 2) & 0xC0;
            ah = ah | al;
            commandCallback(this.di05h_l + 0x40, ah);
            pos = this.di0Fh + this.reader.readByte(this.di02h + 0xA) & 0x7F;
            ah = this.reader.readByte(pos + this.fileConfig.dataOffset);
            al = this.reader.readByte(this.di02h + 0xC);
            al = (al >> 2) & 0xC0;
            al = al & 0xC0;
            ah = ah | al;
            commandCallback(this.di05h_h + 0x40, ah);
        }
        /** init this channel for music */
        initMusic() {
            this.channelPosition = this.reader.readWordBE(this.programPointer) + this.fileConfig.instructionsOffset;
            /// move the programm pointer
            this.programPointer += 2;
            this.playingState = SoundImagChannelState.MUSIC;
        }
        /** init this channel for sound */
        initSound() {
            this.playingState = SoundImagChannelState.SOUND;
        }
        /** read the adlib config for this channel from the giffen offset */
        initChannel(offset, index) {
            offset = offset + index * 20; /// 20: sizeof(Channel-Init-Data)
            this.reader.setOffset(offset);
            /// read Cahnnel-Init-Data
            this.di00h = this.reader.readByte();
            this.waitTime = this.reader.readByte();
            this.di02h = this.reader.readWordBE();
            this.di04h = this.reader.readByte();
            this.di05h_l = this.reader.readByte();
            this.di05h_h = this.reader.readByte();
            this.di07h = this.reader.readByte();
            ;
            this.di08h_h = this.reader.readByte();
            this.di08h_l = this.reader.readByte();
            this.programPointer = this.reader.readWordBE();
            this.channelPosition = this.reader.readWordBE();
            this.unused = this.reader.readByte();
            this.di0Fh = this.reader.readByte();
            this.playingState = this.intToPlayingState(this.reader.readByte());
            this.waitSum = this.reader.readByte();
            this.di12h = this.reader.readByte();
            this.di13h = this.reader.readByte();
        }
        /** convert a number to a playState */
        intToPlayingState(stateVal) {
            switch (stateVal) {
                case 1:
                    return SoundImagChannelState.MUSIC;
                case 2:
                    return SoundImagChannelState.SOUND;
                default:
                    return SoundImagChannelState.NONE;
            }
        }
    }
    Lemmings.SoundImageChannels = SoundImageChannels;
})(Lemmings || (Lemmings = {}));
/// <reference path="../file/binary-reader.ts"/>
/// <reference path="sound-image-manager.ts"/>
var Lemmings;
(function (Lemmings) {
    ;
    /**
     * Player for the SoundImage File for one track that needs to be
     * played.
    */
    class SoundImagePlayer {
        constructor(reader, audioConfig) {
            this.audioConfig = audioConfig;
            /** every track is composed of several channel. */
            this.channels = [];
            this.currentCycle = 0;
            /// are the init Commands send?
            this.initCommandsDone = false;
            /// create a new reader for the data
            this.reader = new Lemmings.BinaryReader(reader);
            this.fileConfig = audioConfig;
        }
        /** init for a sound */
        initSound(soundIndex) {
            ///- reset
            this.channels = [];
            this.channelCount = 0;
            /// check if valid
            if ((soundIndex < 0) || (soundIndex > 17))
                return;
            /// create channel : the original DOS Soundimage format player use channels >= 8 for sounds...but this shouldn't matter
            var ch = this.createChannel(8);
            ch.channelPosition = this.reader.readWordBE(this.fileConfig.soundIndexTablePosition + soundIndex * 2);
            ch.waitTime = 1;
            ch.di13h = 0;
            ch.initSound();
            /// add channel
            this.channels.push(ch);
            this.channelCount = 1;
        }
        /** init for a song */
        initMusic(musicIndex) {
            ///- reset
            this.channels = [];
            this.channelCount = 0;
            /// check if valid
            if (musicIndex < 0)
                return;
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
                var ch = this.createChannel(i);
                /// config channel
                ch.programPointer = this.reader.readWordBE() + this.fileConfig.instructionsOffset;
                ch.instrumentPos = this.instrumentPos;
                ch.initMusic();
                this.channels.push(ch);
            }
            this.debug();
        }
        /** create an SoundImage Channel and init it */
        createChannel(chIndex) {
            var ch = new Lemmings.SoundImageChannels(this.reader, this.fileConfig);
            ch.initChannel(this.fileConfig.adlibChannelConfigPosition, chIndex);
            ch.waitTime = 1;
            ch.soundImageVersion = this.fileConfig.version;
            return ch;
        }
        /** reads the next block of data: call this to process the next data of this channel */
        read(commandCallback) {
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
        doInitTimer(commandCallback) {
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
        doInitCommands(commandCallback) {
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
        debug() {
            let error = new Lemmings.ErrorHandler("SoundImagePlayer");
            error.debug(this.fileConfig);
            error.debug("channelCount: " + this.channelCount);
            error.debug("songHeaderPosition: " + this.songHeaderPosition);
            error.debug("unknownWord: " + this.unknownWord);
            error.debug("waitCycles: " + this.waitCycles);
            error.debug("currentCycle: " + this.currentCycle);
            error.debug("instrumentPos: " + this.instrumentPos);
        }
    }
    Lemmings.SoundImagePlayer = SoundImagePlayer;
})(Lemmings || (Lemmings = {}));
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
var Lemmings;
(function (Lemmings) {
    class OPL3 {
        constructor() {
            this.registers = new Int32Array(0x200);
            this.channels2op = [[], []];
            this.channels4op = [[], []];
            this.nts = 0;
            this.dam = 0;
            this.dvb = 0;
            this.ryt = 0;
            this.bd = 0;
            this.sd = 0;
            this.tom = 0;
            this.tc = 0;
            this.hh = 0;
            this._new = 0;
            this.vibratoIndex = 0;
            this.tremoloIndex = 0;
            this.channels = [new Array(9), new Array(9)];
            this.initOperators();
            this.initChannels2op();
            this.initChannels4op();
            this.initRhythmChannels();
            this.initChannels();
        }
        /** The methods read() and write() are the only
        // ones needed by the user to interface with the emulator.
        // read() returns one frame at a time, to be played at 49700 Hz,
        // with each frame being four 16-bit samples,
        // corresponding to the OPL3 four output channels CHA...CHD. */
        //
        // - Changes: output only 2 Channels
        read(bufferSize) {
            let output = [new Float32Array(bufferSize), new Float32Array(bufferSize)];
            let outputBuffer = new Float32Array(2);
            let channelOutput;
            for (let i = 0; i < bufferSize; i++) {
                for (let outputChannelNumber = 0; outputChannelNumber < 2; outputChannelNumber++)
                    outputBuffer[outputChannelNumber] = 0;
                // If _new = 0, use OPL2 mode with 9 channels. If _new = 1, use OPL3 18 channels;
                for (let array = 0; array < (this._new + 1); array++) {
                    for (let channelNumber = 0; channelNumber < 9; channelNumber++) {
                        // Reads output from each OPL3 channel, and accumulates it in the output buffer:
                        channelOutput = this.channels[array][channelNumber].getChannelOutput();
                        for (let outputChannelNumber = 0; outputChannelNumber < 2; outputChannelNumber++)
                            outputBuffer[outputChannelNumber] += channelOutput[outputChannelNumber];
                    }
                }
                // Normalizes the output buffer after all channels have been added,
                // with a maximum of 18 channels,
                // and multiplies it to get the 16 bit signed output.
                // -> convert to float
                for (let outputChannelNumber = 0; outputChannelNumber < 2; outputChannelNumber++) {
                    output[outputChannelNumber][i] = (outputBuffer[outputChannelNumber] / 18 * 0x7FFF) / 32768;
                }
                // Advances the OPL3-wide vibrato index, which is used by 
                // PhaseGenerator.getPhase() in each Operator.
                this.vibratoIndex++;
                if (this.vibratoIndex >= OPL3Data.vibratoTable[this.dvb].length)
                    this.vibratoIndex = 0;
                // Advances the OPL3-wide tremolo index, which is used by 
                // EnvelopeGenerator.getEnvelope() in each Operator.
                this.tremoloIndex++;
                if (this.tremoloIndex >= OPL3Data.tremoloTable[this.dam].length)
                    this.tremoloIndex = 0;
            }
            return output;
        }
        /** optimised JavaScript Version of Read */
        readMonoLemmings(bufferSize) {
            let output = new Float32Array(bufferSize);
            for (let i = 0; i < bufferSize; i++) {
                // Reads output from each OPL3 channel, and accumulates it in the output buffer:
                let outputValue0 = this.channels[0][0].getChannelOutput()[0];
                outputValue0 += this.channels[0][1].getChannelOutput()[0];
                outputValue0 += this.channels[0][2].getChannelOutput()[0];
                outputValue0 += this.channels[0][3].getChannelOutput()[0];
                outputValue0 += this.channels[0][4].getChannelOutput()[0];
                outputValue0 += this.channels[0][5].getChannelOutput()[0];
                outputValue0 += this.channels[0][6].getChannelOutput()[0];
                outputValue0 += this.channels[0][7].getChannelOutput()[0];
                outputValue0 += this.channels[0][8].getChannelOutput()[0];
                // Normalizes the output buffer after all channels have been added,
                // with a maximum of 18 channels,
                // and multiplies it to get the 16 bit signed output.
                output[i] = outputValue0 * 0.05555386013;
                // Advances the OPL3-wide vibrato index, which is used by 
                // PhaseGenerator.getPhase() in each Operator.
                this.vibratoIndex++;
                if (this.vibratoIndex >= OPL3Data.vibratoTable[this.dvb].length)
                    this.vibratoIndex = 0;
                // Advances the OPL3-wide tremolo index, which is used by 
                // EnvelopeGenerator.getEnvelope() in each Operator.
                this.tremoloIndex++;
                if (this.tremoloIndex >= OPL3Data.tremoloTable[this.dam].length)
                    this.tremoloIndex = 0;
            }
            return output;
        }
        write(array, address, data) {
            // The OPL3 has two registers arrays, each with adresses ranging
            // from 0x00 to 0xF5.
            // This emulator uses one array, with the two original register arrays
            // starting at 0x00 and at 0x100.
            let registerAddress = (array << 8) | address;
            // If the address is out of the OPL3 memory map, returns.
            if (registerAddress < 0 || registerAddress >= 0x200)
                return;
            this.registers[registerAddress] = data;
            switch (address & 0xE0) {
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
                    if (array == 1) {
                        if (address == 0x04)
                            this.update_2_CONNECTIONSEL6();
                        else if (address == 0x05)
                            this.update_7_NEW1();
                    }
                    else if (address == 0x08)
                        this.update_1_NTS1_6();
                    break;
                case 0xA0:
                    // 0xBD is a control register for the entire OPL3:
                    if (address == 0xBD) {
                        if (array == 0)
                            this.update_DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1();
                        break;
                    }
                    // Registers for each channel are in A0-A8, B0-B8, C0-C8, in both register arrays.
                    // 0xB0...0xB8 keeps kon,block,fnum(h) for each channel.
                    if ((address & 0xF0) == 0xB0 && address <= 0xB8) {
                        // If the address is in the second register array, adds 9 to the channel number.
                        // The channel number is given by the last four bits, like in A0,...,A8.
                        this.channels[array][address & 0x0F].update_2_KON1_BLOCK3_FNUMH2();
                        break;
                    }
                    // 0xA0...0xA8 keeps fnum(l) for each channel.
                    if ((address & 0xF0) == 0xA0 && address <= 0xA8)
                        this.channels[array][address & 0x0F].update_FNUML8();
                    break;
                // 0xC0...0xC8 keeps cha,chb,chc,chd,fb,cnt for each channel:
                case 0xC0:
                    if (address <= 0xC8)
                        this.channels[array][address & 0x0F].update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1();
                    break;
                // Registers for each of the 36 Operators:
                default:
                    let operatorOffset = address & 0x1F;
                    if (this.operators[array][operatorOffset] == null)
                        break;
                    switch (address & 0xE0) {
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
        initOperators() {
            let baseAddress = 0;
            // The YMF262 has 36 operators:
            this.operators = [[], []]; //new Operator[2][0x20];
            for (let array = 0; array < 2; array++)
                for (let group = 0; group <= 0x10; group += 8)
                    for (let offset = 0; offset < 6; offset++) {
                        baseAddress = (array << 8) | (group + offset);
                        this.operators[array][group + offset] = new Operator(this, baseAddress);
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
        initChannels2op() {
            // The YMF262 has 18 2-op channels.
            // Each 2-op channel can be at a serial or parallel operator configuration:
            this.channels2op = [[], []]; //new Channel2op[2][9];
            for (let array = 0; array < 2; array++)
                for (let channelNumber = 0; channelNumber < 3; channelNumber++) {
                    let baseAddress = (array << 8) | channelNumber;
                    // Channels 1, 2, 3 -> Operator offsets 0x0,0x3; 0x1,0x4; 0x2,0x5
                    this.channels2op[array][channelNumber] = new Channel2op(this, baseAddress, this.operators[array][channelNumber], this.operators[array][channelNumber + 0x3]);
                    // Channels 4, 5, 6 -> Operator offsets 0x8,0xB; 0x9,0xC; 0xA,0xD
                    this.channels2op[array][channelNumber + 3] = new Channel2op(this, baseAddress + 3, this.operators[array][channelNumber + 0x8], this.operators[array][channelNumber + 0xB]);
                    // Channels 7, 8, 9 -> Operators 0x10,0x13; 0x11,0x14; 0x12,0x15
                    this.channels2op[array][channelNumber + 6] = new Channel2op(this, baseAddress + 6, this.operators[array][channelNumber + 0x10], this.operators[array][channelNumber + 0x13]);
                }
        }
        initChannels4op() {
            // The YMF262 has 3 4-op channels in each array:
            this.channels4op = [[], []]; //new Channel4op[2][3];
            for (let array = 0; array < 2; array++)
                for (let channelNumber = 0; channelNumber < 3; channelNumber++) {
                    let baseAddress = (array << 8) | channelNumber;
                    // Channels 1, 2, 3 -> Operators 0x0,0x3,0x8,0xB; 0x1,0x4,0x9,0xC; 0x2,0x5,0xA,0xD;
                    this.channels4op[array][channelNumber] = new Channel4op(this, baseAddress, this.operators[array][channelNumber], this.operators[array][channelNumber + 0x3], this.operators[array][channelNumber + 0x8], this.operators[array][channelNumber + 0xB]);
                }
        }
        initRhythmChannels() {
            this.bassDrumChannel = new BassDrumChannel(this);
            this.highHatSnareDrumChannel = new HighHatSnareDrumChannel(this);
            this.tomTomTopCymbalChannel = new TomTomTopCymbalChannel(this);
        }
        initChannels() {
            // Channel is an abstract class that can be a 2-op, 4-op, rhythm or disabled channel, 
            // depending on the OPL3 configuration at the time.
            // channels[] inits as a 2-op serial channel array:
            for (let array = 0; array < 2; array++)
                for (let i = 0; i < 9; i++)
                    this.channels[array][i] = this.channels2op[array][i];
            // Unique instance to fill future gaps in the Channel array,
            // when there will be switches between 2op and 4op mode.
            this.disabledChannel = new DisabledChannel(this);
        }
        update_1_NTS1_6() {
            let _1_nts1_6 = this.registers[OPL3Data._1_NTS1_6_Offset];
            // Note Selection. This register is used in Channel.updateOperators() implementations,
            // to calculate the channel´s Key Scale Number.
            // The value of the actual envelope rate follows the value of
            // OPL3.nts,Operator.keyScaleNumber and Operator.ksr
            this.nts = (_1_nts1_6 & 0x40) >> 6;
        }
        update_DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1() {
            let dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 = this.registers[OPL3Data.DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1_Offset];
            // Depth of amplitude. This register is used in EnvelopeGenerator.getEnvelope();
            this.dam = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x80) >> 7;
            // Depth of vibrato. This register is used in PhaseGenerator.getPhase();
            this.dvb = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x40) >> 6;
            let new_ryt = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x20) >> 5;
            if (new_ryt != this.ryt) {
                this.ryt = new_ryt;
                this.setRhythmMode();
            }
            let new_bd = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x10) >> 4;
            if (new_bd != this.bd) {
                this.bd = new_bd;
                if (this.bd == 1) {
                    this.bassDrumChannel.op1.keyOn();
                    this.bassDrumChannel.op2.keyOn();
                }
            }
            let new_sd = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x08) >> 3;
            if (new_sd != this.sd) {
                this.sd = new_sd;
                if (this.sd == 1)
                    this.snareDrumOperator.keyOn();
            }
            let new_tom = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x04) >> 2;
            if (new_tom != this.tom) {
                this.tom = new_tom;
                if (this.tom == 1)
                    this.tomTomOperator.keyOn();
            }
            let new_tc = (dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x02) >> 1;
            if (new_tc != this.tc) {
                this.tc = new_tc;
                if (this.tc == 1)
                    this.topCymbalOperator.keyOn();
            }
            let new_hh = dam1_dvb1_ryt1_bd1_sd1_tom1_tc1_hh1 & 0x01;
            if (new_hh != this.hh) {
                this.hh = new_hh;
                if (this.hh == 1)
                    this.highHatOperator.keyOn();
            }
        }
        update_7_NEW1() {
            let _7_new1 = this.registers[OPL3Data._7_NEW1_Offset];
            // OPL2/OPL3 mode selection. This register is used in 
            // OPL3.read(), OPL3.write() and Operator.getOperatorOutput();
            this._new = (_7_new1 & 0x01);
            if (this._new == 1)
                this.setEnabledChannels();
            this.set4opConnections();
        }
        setEnabledChannels() {
            for (let array = 0; array < 2; array++)
                for (let i = 0; i < 9; i++) {
                    let baseAddress = this.channels[array][i].channelBaseAddress;
                    this.registers[baseAddress + ChannelData.CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset] |= 0xF0;
                    this.channels[array][i].update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1();
                }
        }
        update_2_CONNECTIONSEL6() {
            // This method is called only if _new is set.
            let _2_connectionsel6 = this.registers[OPL3Data._2_CONNECTIONSEL6_Offset];
            // 2-op/4-op channel selection. This register is used here to configure the OPL3.channels[] array.
            this.connectionsel = (_2_connectionsel6 & 0x3F);
            this.set4opConnections();
        }
        set4opConnections() {
            // bits 0, 1, 2 sets respectively 2-op channels (1,4), (2,5), (3,6) to 4-op operation.
            // bits 3, 4, 5 sets respectively 2-op channels (10,13), (11,14), (12,15) to 4-op operation.
            for (let array = 0; array < 2; array++)
                for (let i = 0; i < 3; i++) {
                    if (this._new == 1) {
                        let shift = array * 3 + i;
                        let connectionBit = (this.connectionsel >> shift) & 0x01;
                        if (connectionBit == 1) {
                            this.channels[array][i] = this.channels4op[array][i];
                            this.channels[array][i + 3] = this.disabledChannel;
                            this.channels[array][i].updateChannel();
                            continue;
                        }
                    }
                    this.channels[array][i] = this.channels2op[array][i];
                    this.channels[array][i + 3] = this.channels2op[array][i + 3];
                    this.channels[array][i].updateChannel();
                    this.channels[array][i + 3].updateChannel();
                }
        }
        setRhythmMode() {
            if (this.ryt == 1) {
                this.channels[0][6] = this.bassDrumChannel;
                this.channels[0][7] = this.highHatSnareDrumChannel;
                this.channels[0][8] = this.tomTomTopCymbalChannel;
                this.operators[0][0x11] = this.highHatOperator;
                this.operators[0][0x14] = this.snareDrumOperator;
                this.operators[0][0x12] = this.tomTomOperator;
                this.operators[0][0x15] = this.topCymbalOperator;
            }
            else {
                for (let i = 6; i <= 8; i++)
                    this.channels[0][i] = this.channels2op[0][i];
                this.operators[0][0x11] = this.highHatOperatorInNonRhythmMode;
                this.operators[0][0x14] = this.snareDrumOperatorInNonRhythmMode;
                this.operators[0][0x12] = this.tomTomOperatorInNonRhythmMode;
                this.operators[0][0x15] = this.topCymbalOperatorInNonRhythmMode;
            }
            for (let i = 6; i <= 8; i++)
                this.channels[0][i].updateChannel();
        }
    }
    Lemmings.OPL3 = OPL3;
    //
    // Channels
    //
    class Channel {
        constructor(opl, baseAddress) {
            this.opl = opl;
            this.fnuml = 0;
            this.fnumh = 0;
            this.kon = 0;
            this.block = 0;
            this.cha = 0;
            this.chb = 0;
            this.chc = 0;
            this.chd = 0;
            this.fb = 0;
            this.cnt = 0;
            // Factor to convert between normalized amplitude to normalized
            // radians. The amplitude maximum is equivalent to 8*Pi radians.
            this.toPhase = 4;
            this.channelBaseAddress = baseAddress;
            this.feedback = new Float32Array(2);
            this.feedback[0] = this.feedback[1] = 0;
        }
        update_2_KON1_BLOCK3_FNUMH2() {
            let _2_kon1_block3_fnumh2 = this.opl.registers[this.channelBaseAddress + ChannelData._2_KON1_BLOCK3_FNUMH2_Offset];
            // Frequency Number (hi-register) and Block. These two registers, together with fnuml, 
            // sets the Channel´s base frequency;
            this.block = (_2_kon1_block3_fnumh2 & 0x1C) >> 2;
            this.fnumh = _2_kon1_block3_fnumh2 & 0x03;
            this.updateOperators();
            // Key On. If changed, calls Channel.keyOn() / keyOff().
            let newKon = (_2_kon1_block3_fnumh2 & 0x20) >> 5;
            if (newKon != this.kon) {
                if (newKon == 1)
                    this.keyOn();
                else
                    this.keyOff();
                this.kon = newKon;
            }
        }
        update_FNUML8() {
            let fnuml8 = this.opl.registers[this.channelBaseAddress + ChannelData.FNUML8_Offset];
            // Frequency Number, low register.
            this.fnuml = fnuml8 & 0xFF;
            this.updateOperators();
        }
        update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1() {
            let chd1_chc1_chb1_cha1_fb3_cnt1 = this.opl.registers[this.channelBaseAddress + ChannelData.CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset];
            this.chd = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x80) >> 7;
            this.chc = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x40) >> 6;
            this.chb = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x20) >> 5;
            this.cha = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x10) >> 4;
            this.fb = (chd1_chc1_chb1_cha1_fb3_cnt1 & 0x0E) >> 1;
            this.cnt = chd1_chc1_chb1_cha1_fb3_cnt1 & 0x01;
            this.updateOperators();
        }
        updateChannel() {
            this.update_2_KON1_BLOCK3_FNUMH2();
            this.update_FNUML8();
            this.update_CHD1_CHC1_CHB1_CHA1_FB3_CNT1();
        }
        getInFourChannels(channelOutput) {
            let output = new Float32Array(4);
            if (this.opl._new == 0)
                output[0] = output[1] = output[2] = output[3] = channelOutput;
            else {
                output[0] = (this.cha == 1) ? channelOutput : 0;
                output[1] = (this.chb == 1) ? channelOutput : 0;
                output[2] = (this.chc == 1) ? channelOutput : 0;
                output[3] = (this.chd == 1) ? channelOutput : 0;
            }
            return output;
        }
    }
    class Channel2op extends Channel {
        constructor(opl, baseAddress, o1, o2) {
            super(opl, baseAddress);
            this.op1 = o1;
            this.op2 = o2;
        }
        getChannelOutput() {
            let channelOutput = 0, op1Output = 0, op2Output = 0;
            let output;
            // The feedback uses the last two outputs from
            // the first operator, instead of just the last one. 
            let feedbackOutput = (this.feedback[0] + this.feedback[1]) / 2;
            switch (this.cnt) {
                // CNT = 0, the operators are in series, with the first in feedback.
                case 0:
                    if (this.op2.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF)
                        return this.getInFourChannels(0);
                    op1Output = this.op1.getOperatorOutput(feedbackOutput);
                    channelOutput = this.op2.getOperatorOutput(op1Output * this.toPhase);
                    break;
                // CNT = 1, the operators are in parallel, with the first in feedback.    
                case 1:
                    if (this.op1.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF &&
                        this.op2.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF)
                        return this.getInFourChannels(0);
                    op1Output = this.op1.getOperatorOutput(feedbackOutput);
                    op2Output = this.op2.getOperatorOutput(Operator.noModulator);
                    channelOutput = (op1Output + op2Output) / 2;
            }
            this.feedback[0] = this.feedback[1];
            this.feedback[1] = (op1Output * ChannelData.feedback[this.fb]) % 1;
            output = this.getInFourChannels(channelOutput);
            return output;
        }
        keyOn() {
            this.op1.keyOn();
            this.op2.keyOn();
            this.feedback[0] = this.feedback[1] = 0;
        }
        keyOff() {
            this.op1.keyOff();
            this.op2.keyOff();
        }
        updateOperators() {
            // Key Scale Number, used in EnvelopeGenerator.setActualRates().
            let keyScaleNumber = this.block * 2 + ((this.fnumh >> this.opl.nts) & 0x01);
            let f_number = (this.fnumh << 8) | this.fnuml;
            this.op1.updateOperator(keyScaleNumber, f_number, this.block);
            this.op2.updateOperator(keyScaleNumber, f_number, this.block);
        }
        toString() {
            let str = "";
            let f_number = (this.fnumh << 8) + this.fnuml;
            str += "channelBaseAddress: %d\n", this.channelBaseAddress;
            str += "f_number: %d, block: %d\n", f_number, this.block;
            str += "cnt: %d, feedback: %d\n", this.cnt, this.fb;
            str += "op1:\n%s", this.op1.toString();
            str += "op2:\n%s", this.op2.toString();
            return str.toString();
        }
    }
    class Channel4op extends Channel {
        constructor(opl, baseAddress, o1, o2, o3, o4) {
            super(opl, baseAddress);
            this.op1 = o1;
            this.op2 = o2;
            this.op3 = o3;
            this.op4 = o4;
        }
        getChannelOutput() {
            let channelOutput = 0;
            let op1Output = 0;
            let op2Output = 0;
            let op3Output = 0;
            let op4Output = 0;
            let output;
            let secondChannelBaseAddress = this.channelBaseAddress + 3;
            let secondCnt = this.opl.registers[secondChannelBaseAddress + ChannelData.CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset] & 0x1;
            let cnt4op = (this.cnt << 1) | secondCnt;
            let feedbackOutput = (this.feedback[0] + this.feedback[1]) / 2;
            switch (cnt4op) {
                case 0:
                    if (this.op4.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF)
                        return this.getInFourChannels(0);
                    op1Output = this.op1.getOperatorOutput(feedbackOutput);
                    op2Output = this.op2.getOperatorOutput(op1Output * this.toPhase);
                    op3Output = this.op3.getOperatorOutput(op2Output * this.toPhase);
                    channelOutput = this.op4.getOperatorOutput(op3Output * this.toPhase);
                    break;
                case 1:
                    if (this.op2.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF &&
                        this.op4.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF)
                        return this.getInFourChannels(0);
                    op1Output = this.op1.getOperatorOutput(feedbackOutput);
                    op2Output = this.op2.getOperatorOutput(op1Output * this.toPhase);
                    op3Output = this.op3.getOperatorOutput(Operator.noModulator);
                    op4Output = this.op4.getOperatorOutput(op3Output * this.toPhase);
                    channelOutput = (op2Output + op4Output) / 2;
                    break;
                case 2:
                    if (this.op1.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF &&
                        this.op4.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF)
                        return this.getInFourChannels(0);
                    op1Output = this.op1.getOperatorOutput(feedbackOutput);
                    op2Output = this.op2.getOperatorOutput(Operator.noModulator);
                    op3Output = this.op3.getOperatorOutput(op2Output * this.toPhase);
                    op4Output = this.op4.getOperatorOutput(op3Output * this.toPhase);
                    channelOutput = (op1Output + op4Output) / 2;
                    break;
                case 3:
                    if (this.op1.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF &&
                        this.op3.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF &&
                        this.op4.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF)
                        return this.getInFourChannels(0);
                    op1Output = this.op1.getOperatorOutput(feedbackOutput);
                    op2Output = this.op2.getOperatorOutput(Operator.noModulator);
                    op3Output = this.op3.getOperatorOutput(op2Output * this.toPhase);
                    op4Output = this.op4.getOperatorOutput(Operator.noModulator);
                    channelOutput = (op1Output + op3Output + op4Output) / 3;
            }
            this.feedback[0] = this.feedback[1];
            this.feedback[1] = (op1Output * ChannelData.feedback[this.fb]) % 1;
            output = this.getInFourChannels(channelOutput);
            return output;
        }
        keyOn() {
            this.op1.keyOn();
            this.op2.keyOn();
            this.op3.keyOn();
            this.op4.keyOn();
            this.feedback[0] = this.feedback[1] = 0;
        }
        keyOff() {
            this.op1.keyOff();
            this.op2.keyOff();
            this.op3.keyOff();
            this.op4.keyOff();
        }
        updateOperators() {
            // Key Scale Number, used in EnvelopeGenerator.setActualRates().
            let keyScaleNumber = this.block * 2 + ((this.fnumh >> this.opl.nts) & 0x01);
            let f_number = (this.fnumh << 8) | this.fnuml;
            this.op1.updateOperator(keyScaleNumber, f_number, this.block);
            this.op2.updateOperator(keyScaleNumber, f_number, this.block);
            this.op3.updateOperator(keyScaleNumber, f_number, this.block);
            this.op4.updateOperator(keyScaleNumber, f_number, this.block);
        }
        toString() {
            let str = "";
            let f_number = (this.fnumh << 8) + this.fnuml;
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
        constructor(opl) {
            super(opl, 0);
        }
        getChannelOutput() { return this.getInFourChannels(0); }
        keyOn() { }
        keyOff() { }
        updateOperators() { }
    }
    //
    // Operators
    //
    class Operator {
        constructor(opl, baseAddress) {
            this.opl = opl;
            this.envelope = 0;
            this.phase = 0;
            this.operatorBaseAddress = 0;
            this.am = 0;
            this.vib = 0;
            this.ksr = 0;
            this.egt = 0;
            this.mult = 0;
            this.ksl = 0;
            this.tl = 0;
            this.ar = 0;
            this.dr = 0;
            this.sl = 0;
            this.rr = 0;
            this.ws = 0;
            this.keyScaleNumber = 0;
            this.f_number = 0;
            this.block = 0;
            this.operatorBaseAddress = baseAddress;
            this.phaseGenerator = new PhaseGenerator(opl);
            this.envelopeGenerator = new EnvelopeGenerator(opl);
        }
        update_AM1_VIB1_EGT1_KSR1_MULT4() {
            let am1_vib1_egt1_ksr1_mult4 = this.opl.registers[this.operatorBaseAddress + OperatorData.AM1_VIB1_EGT1_KSR1_MULT4_Offset];
            // Amplitude Modulation. This register is used int EnvelopeGenerator.getEnvelope();
            this.am = (am1_vib1_egt1_ksr1_mult4 & 0x80) >> 7;
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
        update_KSL2_TL6() {
            let ksl2_tl6 = this.opl.registers[this.operatorBaseAddress + OperatorData.KSL2_TL6_Offset];
            // Key Scale Level. Sets the attenuation in accordance with the octave.
            this.ksl = (ksl2_tl6 & 0xC0) >> 6;
            // Total Level. Sets the overall damping for the envelope.
            this.tl = ksl2_tl6 & 0x3F;
            this.envelopeGenerator.setAtennuation(this.f_number, this.block, this.ksl);
            this.envelopeGenerator.setTotalLevel(this.tl);
        }
        update_AR4_DR4() {
            let ar4_dr4 = this.opl.registers[this.operatorBaseAddress + OperatorData.AR4_DR4_Offset];
            // Attack Rate.
            this.ar = (ar4_dr4 & 0xF0) >> 4;
            // Decay Rate.
            this.dr = ar4_dr4 & 0x0F;
            this.envelopeGenerator.setActualAttackRate(this.ar, this.ksr, this.keyScaleNumber);
            this.envelopeGenerator.setActualDecayRate(this.dr, this.ksr, this.keyScaleNumber);
        }
        update_SL4_RR4() {
            let sl4_rr4 = this.opl.registers[this.operatorBaseAddress + OperatorData.SL4_RR4_Offset];
            // Sustain Level.
            this.sl = (sl4_rr4 & 0xF0) >> 4;
            // Release Rate.
            this.rr = sl4_rr4 & 0x0F;
            this.envelopeGenerator.setActualSustainLevel(this.sl);
            this.envelopeGenerator.setActualReleaseRate(this.rr, this.ksr, this.keyScaleNumber);
        }
        update_5_WS3() {
            let _5_ws3 = this.opl.registers[this.operatorBaseAddress + OperatorData._5_WS3_Offset];
            this.ws = _5_ws3 & 0x07;
        }
        getOperatorOutput(modulator) {
            if (this.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF)
                return 0;
            let envelopeInDB = this.envelopeGenerator.getEnvelope(this.egt, this.am);
            this.envelope = Math.pow(10, envelopeInDB / 10.0);
            // If it is in OPL2 mode, use first four waveforms only:
            this.ws &= ((this.opl._new << 2) + 3);
            let waveform = OperatorData.waveforms[this.ws];
            this.phase = this.phaseGenerator.getPhase(this.vib);
            let operatorOutput = this.getOutput(modulator, this.phase, waveform);
            return operatorOutput;
        }
        getOutput(modulator, outputPhase, waveform) {
            outputPhase = (outputPhase + modulator) % 1;
            if (outputPhase < 0) {
                outputPhase++;
                // If the double could not afford to be less than 1:
                outputPhase %= 1;
            }
            let sampleIndex = (outputPhase * OperatorData.waveLength) | 0;
            return waveform[sampleIndex] * this.envelope;
        }
        keyOn() {
            if (this.ar > 0) {
                this.envelopeGenerator.keyOn();
                this.phaseGenerator.keyOn();
            }
            else
                this.envelopeGenerator.stage = EnvelopeGenerator.Stage.OFF;
        }
        keyOff() {
            this.envelopeGenerator.keyOff();
        }
        updateOperator(ksn, f_num, blk) {
            this.keyScaleNumber = ksn;
            this.f_number = f_num;
            this.block = blk;
            this.update_AM1_VIB1_EGT1_KSR1_MULT4();
            this.update_KSL2_TL6();
            this.update_AR4_DR4();
            this.update_SL4_RR4();
            this.update_5_WS3();
        }
        toString() {
            let str = "";
            let operatorFrequency = this.f_number * Math.pow(2, this.block - 1) * OPL3Data.sampleRate / Math.pow(2, 19) * OperatorData.multTable[this.mult];
            str += "operatorBaseAddress: %d\n", this.operatorBaseAddress;
            str += "operatorFrequency: %f\n", operatorFrequency;
            str += "mult: %d, ar: %d, dr: %d, sl: %d, rr: %d, ws: %d\n", this.mult, this.ar, this.dr, this.sl, this.rr, this.ws;
            str += "am: %d, vib: %d, ksr: %d, egt: %d, ksl: %d, tl: %d\n", this.am, this.vib, this.ksr, this.egt, this.ksl, this.tl;
            return str;
        }
    }
    Operator.noModulator = 0;
    //
    // Envelope Generator
    //
    class EnvelopeGenerator {
        constructor(opl) {
            this.opl = opl;
            this.stage = EnvelopeGenerator.Stage.OFF;
            this.actualAttackRate = 0;
            this.actualDecayRate = 0;
            this.xAttackIncrement = 0;
            this.xMinimumInAttack = 0;
            this.dBdecayIncrement = 0;
            this.dBreleaseIncrement = 0;
            this.attenuation = 0;
            this.totalLevel = 0;
            this.sustainLevel = 0;
            this.x = 0;
            this.envelope = 0;
            this.x = this.dBtoX(-96);
            this.envelope = -96;
        }
        setActualSustainLevel(sl) {
            // If all SL bits are 1, sustain level is set to -93 dB:
            if (sl == 0x0F) {
                this.sustainLevel = -93;
                return;
            }
            // The datasheet states that the SL formula is
            // sustainLevel = -24*d7 -12*d6 -6*d5 -3*d4,
            // translated as:
            this.sustainLevel = -3 * sl;
        }
        setTotalLevel(tl) {
            // The datasheet states that the TL formula is
            // TL = -(24*d5 + 12*d4 + 6*d3 + 3*d2 + 1.5*d1 + 0.75*d0),
            // translated as:
            this.totalLevel = tl * -0.75;
        }
        setAtennuation(f_number, block, ksl) {
            let hi4bits = (f_number >> 6) & 0x0F;
            switch (ksl) {
                case 0:
                    this.attenuation = 0;
                    break;
                case 1:
                    // ~3 dB/Octave
                    this.attenuation = OperatorData.ksl3dBtable[hi4bits][block];
                    break;
                case 2:
                    // ~1.5 dB/Octave
                    this.attenuation = OperatorData.ksl3dBtable[hi4bits][block] / 2;
                    break;
                case 3:
                    // ~6 dB/Octave
                    this.attenuation = OperatorData.ksl3dBtable[hi4bits][block] * 2;
            }
        }
        setActualAttackRate(attackRate, ksr, keyScaleNumber) {
            // According to the YMF278B manual's OPL3 section, the attack curve is exponential,
            // with a dynamic range from -96 dB to 0 dB and a resolution of 0.1875 dB 
            // per level.
            //
            // This method sets an attack increment and attack minimum value 
            // that creates a exponential dB curve with 'period0to100' seconds in length
            // and 'period10to90' seconds between 10% and 90% of the curve total level.
            this.actualAttackRate = this.calculateActualRate(attackRate, ksr, keyScaleNumber);
            let period0to100inSeconds = (EnvelopeGeneratorData.attackTimeValuesTable[this.actualAttackRate][0] / 1000);
            let period0to100inSamples = (period0to100inSeconds * OPL3Data.sampleRate) | 0;
            let period10to90inSeconds = (EnvelopeGeneratorData.attackTimeValuesTable[this.actualAttackRate][1] / 1000);
            let period10to90inSamples = (period10to90inSeconds * OPL3Data.sampleRate) | 0;
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
            this.xMinimumInAttack = this.percentageToX(0.1) - (period0to100inSamples - period10to100inSamples) * this.xAttackIncrement;
        }
        setActualDecayRate(decayRate, ksr, keyScaleNumber) {
            this.actualDecayRate = this.calculateActualRate(decayRate, ksr, keyScaleNumber);
            let period10to90inSeconds = EnvelopeGeneratorData.decayAndReleaseTimeValuesTable[this.actualDecayRate][1] / 1000;
            // Differently from the attack curve, the decay/release curve is linear.        
            // The dB increment is dictated by the period between 10% and 90%:
            this.dBdecayIncrement = OPL3Data.calculateIncrement(this.percentageToDB(0.1), this.percentageToDB(0.9), period10to90inSeconds);
        }
        setActualReleaseRate(releaseRate, ksr, keyScaleNumber) {
            this.actualReleaseRate = this.calculateActualRate(releaseRate, ksr, keyScaleNumber);
            let period10to90inSeconds = EnvelopeGeneratorData.decayAndReleaseTimeValuesTable[this.actualReleaseRate][1] / 1000;
            this.dBreleaseIncrement = OPL3Data.calculateIncrement(this.percentageToDB(0.1), this.percentageToDB(0.9), period10to90inSeconds);
        }
        calculateActualRate(rate, ksr, keyScaleNumber) {
            let rof = EnvelopeGeneratorData.rateOffset[ksr][keyScaleNumber];
            let actualRate = rate * 4 + rof;
            // If, as an example at the maximum, rate is 15 and the rate offset is 15, 
            // the value would
            // be 75, but the maximum allowed is 63:
            if (actualRate > 63)
                actualRate = 63;
            return actualRate;
        }
        getEnvelope(egt, am) {
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
            switch (this.stage) {
                case EnvelopeGenerator.Stage.ATTACK:
                    // Since the attack is exponential, it will never reach 0 dB, so
                    // we´ll work with the next to maximum in the envelope resolution.
                    if (this.envelope < -envelopeResolution && this.xAttackIncrement != -Infinity) {
                        // The attack is exponential.
                        this.envelope = -Math.pow(2, this.x);
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
                    if (this.envelope > envelopeSustainLevel) {
                        this.envelope -= this.dBdecayIncrement;
                        break;
                    }
                    else
                        this.stage = EnvelopeGenerator.Stage.SUSTAIN;
                case EnvelopeGenerator.Stage.SUSTAIN:
                    // The Sustain stage is mantained all the time of the Key ON,
                    // even if we are in non-sustaining mode.
                    // This is necessary because, if the key is still pressed, we can
                    // change back and forth the state of EGT, and it will release and
                    // hold again accordingly.
                    if (egt == 1)
                        break;
                    else {
                        if (this.envelope > envelopeMinimum)
                            this.envelope -= this.dBreleaseIncrement;
                        else
                            this.stage = EnvelopeGenerator.Stage.OFF;
                    }
                    break;
                case EnvelopeGenerator.Stage.RELEASE:
                    // If we have Key OFF, only here we are in the Release stage.
                    // Now, we can turn EGT back and forth and it will have no effect,i.e.,
                    // it will release inexorably to the Off stage.
                    if (this.envelope > envelopeMinimum)
                        this.envelope -= this.dBreleaseIncrement;
                    else
                        this.stage = EnvelopeGenerator.Stage.OFF;
            }
            // Ongoing original envelope
            outputEnvelope = this.envelope;
            //Tremolo
            if (am == 1)
                outputEnvelope += envelopeTremolo;
            //Attenuation
            outputEnvelope += envelopeAttenuation;
            //Total Level
            outputEnvelope += envelopeTotalLevel;
            return outputEnvelope;
        }
        keyOn() {
            // If we are taking it in the middle of a previous envelope, 
            // start to rise from the current level:
            // envelope = - (2 ^ x); ->
            // 2 ^ x = -envelope ->
            // x = log2(-envelope); ->
            let xCurrent = OperatorData.log2(-this.envelope);
            this.x = xCurrent < this.xMinimumInAttack ? xCurrent : this.xMinimumInAttack;
            this.stage = EnvelopeGenerator.Stage.ATTACK;
        }
        keyOff() {
            if (this.stage != EnvelopeGenerator.Stage.OFF)
                this.stage = EnvelopeGenerator.Stage.RELEASE;
        }
        dBtoX(dB) {
            return OperatorData.log2(-dB);
        }
        percentageToDB(percentage) {
            return Math.log10(percentage) * 10;
        }
        percentageToX(percentage) {
            return this.dBtoX(this.percentageToDB(percentage));
        }
        toString() {
            let str = "";
            str += "Envelope Generator: \n";
            let attackPeriodInSeconds = EnvelopeGeneratorData.attackTimeValuesTable[this.actualAttackRate][0] / 1000;
            str += "\tATTACK  %f s, rate %d. \n", attackPeriodInSeconds, this.actualAttackRate;
            let decayPeriodInSeconds = EnvelopeGeneratorData.decayAndReleaseTimeValuesTable[this.actualDecayRate][0] / 1000;
            str += "\tDECAY   %f s, rate %d. \n", decayPeriodInSeconds, this.actualDecayRate;
            str += "\tSL      %f dB. \n", this.sustainLevel;
            let releasePeriodInSeconds = EnvelopeGeneratorData.decayAndReleaseTimeValuesTable[this.actualReleaseRate][0] / 1000;
            str += "\tRELEASE %f s, rate %d. \n", releasePeriodInSeconds, this.actualReleaseRate;
            str += "\n";
            return str.toString();
        }
    }
    EnvelopeGenerator.INFINITY = null;
    (function (EnvelopeGenerator) {
        class Stage {
        }
        Stage.ATTACK = 'ATTACK';
        Stage.DECAY = 'DECAY';
        Stage.SUSTAIN = 'SUSTAIN';
        Stage.RELEASE = 'RELEASE';
        Stage.OFF = 'OFF';
        EnvelopeGenerator.Stage = Stage;
        ;
    })(EnvelopeGenerator || (EnvelopeGenerator = {}));
    //
    // Phase Generator
    //
    class PhaseGenerator {
        constructor(opl) {
            this.opl = opl;
            this.phase = 0;
            this.phaseIncrement = 0;
        }
        setFrequency(f_number, block, mult) {
            // This frequency formula is derived from the following equation:
            // f_number = baseFrequency * pow(2,19) / sampleRate / pow(2,block-1);        
            let baseFrequency = f_number * Math.pow(2, block - 1) * OPL3Data.sampleRate / Math.pow(2, 19);
            let operatorFrequency = baseFrequency * OperatorData.multTable[mult];
            // phase goes from 0 to 1 at 
            // period = (1/frequency) seconds ->
            // Samples in each period is (1/frequency)*sampleRate =
            // = sampleRate/frequency ->
            // So the increment in each sample, to go from 0 to 1, is:
            // increment = (1-0) / samples in the period -> 
            // increment = 1 / (OPL3Data.sampleRate/operatorFrequency) ->
            this.phaseIncrement = operatorFrequency / OPL3Data.sampleRate;
        }
        getPhase(vib) {
            if (vib == 1)
                // phaseIncrement = (operatorFrequency * vibrato) / sampleRate
                this.phase += this.phaseIncrement * OPL3Data.vibratoTable[this.opl.dvb][this.opl.vibratoIndex];
            else
                // phaseIncrement = operatorFrequency / sampleRate
                this.phase += this.phaseIncrement;
            this.phase %= 1;
            return this.phase;
        }
        keyOn() {
            this.phase = 0;
        }
        toString() {
            return "Operator frequency: " + OPL3Data.sampleRate * this.phaseIncrement + " Hz.\n";
        }
    }
    //
    // Rhythm
    //
    /** The getOperatorOutput() method in TopCymbalOperator, HighHatOperator and SnareDrumOperator
    // were made through purely empyrical reverse engineering of the OPL3 output. */
    class RhythmChannel extends Channel2op {
        constructor(opl, baseAddress, o1, o2) {
            super(opl, baseAddress, o1, o2);
        }
        getChannelOutput() {
            let channelOutput = 0;
            let op1Output = 0;
            let op2Output = 0;
            let output;
            // Note that, different from the common channel,
            // we do not check to see if the Operator's envelopes are Off.
            // Instead, we always do the calculations, 
            // to update the publicly available phase.
            op1Output = this.op1.getOperatorOutput(Operator.noModulator);
            op2Output = this.op2.getOperatorOutput(Operator.noModulator);
            channelOutput = (op1Output + op2Output) / 2;
            output = this.getInFourChannels(channelOutput);
            return output;
        }
        ;
        // Rhythm channels are always running, 
        // only the envelope is activated by the user.
        keyOn() { }
        ;
        keyOff() { }
        ;
    }
    class HighHatSnareDrumChannel extends RhythmChannel {
        constructor(opl) {
            super(opl, HighHatSnareDrumChannel.highHatSnareDrumChannelBaseAddress, opl.highHatOperator, opl.snareDrumOperator);
        }
    }
    HighHatSnareDrumChannel.highHatSnareDrumChannelBaseAddress = 7;
    class TomTomTopCymbalChannel extends RhythmChannel {
        constructor(opl) {
            super(opl, TomTomTopCymbalChannel.tomTomTopCymbalChannelBaseAddress, opl.tomTomOperator, opl.topCymbalOperator);
        }
    }
    TomTomTopCymbalChannel.tomTomTopCymbalChannelBaseAddress = 8;
    class TopCymbalOperator extends Operator {
        constructor(opl, baseAddress = 0x15) {
            super(opl, baseAddress);
        }
        getOperatorOutput(modulator) {
            let highHatOperatorPhase = this.opl.highHatOperator.phase * OperatorData.multTable[this.opl.highHatOperator.mult];
            // The Top Cymbal operator uses his own phase together with the High Hat phase.
            return this.getOperatorOutputEx(modulator, highHatOperatorPhase);
        }
        // This method is used here with the HighHatOperator phase
        // as the externalPhase. 
        // Conversely, this method is also used through inheritance by the HighHatOperator, 
        // now with the TopCymbalOperator phase as the externalPhase.
        getOperatorOutputEx(modulator, externalPhase) {
            let envelopeInDB = this.envelopeGenerator.getEnvelope(this.egt, this.am);
            this.envelope = Math.pow(10, envelopeInDB / 10.0);
            this.phase = this.phaseGenerator.getPhase(this.vib);
            let waveIndex = this.ws & ((this.opl._new << 2) + 3);
            let waveform = OperatorData.waveforms[waveIndex];
            // Empirically tested multiplied phase for the Top Cymbal:
            let carrierPhase = (8 * this.phase) % 1;
            let modulatorPhase = externalPhase;
            let modulatorOutput = this.getOutput(Operator.noModulator, modulatorPhase, waveform);
            let carrierOutput = this.getOutput(modulatorOutput, carrierPhase, waveform);
            let cycles = 4;
            if ((carrierPhase * cycles) % cycles > 0.1)
                carrierOutput = 0;
            return carrierOutput * 2;
        }
    }
    class HighHatOperator extends TopCymbalOperator {
        constructor(opl) {
            super(opl, HighHatOperator.highHatOperatorBaseAddress);
        }
        getOperatorOutput(modulator) {
            let topCymbalOperatorPhase = this.opl.topCymbalOperator.phase * OperatorData.multTable[this.opl.topCymbalOperator.mult];
            // The sound output from the High Hat resembles the one from
            // Top Cymbal, so we use the parent method and modifies his output
            // accordingly afterwards.
            let operatorOutput = super.getOperatorOutputEx(modulator, topCymbalOperatorPhase);
            if (operatorOutput == 0)
                operatorOutput = Math.random() * this.envelope;
            return operatorOutput;
        }
    }
    HighHatOperator.highHatOperatorBaseAddress = 0x11;
    class SnareDrumOperator extends Operator {
        constructor(opl) {
            super(opl, SnareDrumOperator.snareDrumOperatorBaseAddress);
        }
        getOperatorOutput(modulator) {
            if (this.envelopeGenerator.stage == EnvelopeGenerator.Stage.OFF)
                return 0;
            let envelopeInDB = this.envelopeGenerator.getEnvelope(this.egt, this.am);
            this.envelope = Math.pow(10, envelopeInDB / 10.0);
            // If it is in OPL2 mode, use first four waveforms only:
            let waveIndex = this.ws & ((this.opl._new << 2) + 3);
            let waveform = OperatorData.waveforms[waveIndex];
            this.phase = this.opl.highHatOperator.phase * 2;
            let operatorOutput = this.getOutput(modulator, this.phase, waveform);
            let noise = Math.random() * this.envelope;
            if (operatorOutput / this.envelope != 1 && operatorOutput / this.envelope != -1) {
                if (operatorOutput > 0)
                    operatorOutput = noise;
                else if (operatorOutput < 0)
                    operatorOutput = -noise;
                else
                    operatorOutput = 0;
            }
            return operatorOutput * 2;
        }
    }
    SnareDrumOperator.snareDrumOperatorBaseAddress = 0x14;
    class TomTomOperator extends Operator {
        constructor(opl) {
            super(opl, TomTomOperator.tomTomOperatorBaseAddress);
        }
    }
    TomTomOperator.tomTomOperatorBaseAddress = 0x12;
    class BassDrumChannel extends Channel2op {
        constructor(opl) {
            super(opl, BassDrumChannel.bassDrumChannelBaseAddress, new Operator(opl, BassDrumChannel.op1BaseAddress), new Operator(opl, BassDrumChannel.op2BaseAddress));
        }
        getChannelOutput() {
            // Bass Drum ignores first operator, when it is in series.
            if (this.cnt == 1)
                this.op1.ar = 0;
            return super.getChannelOutput();
        }
        // Key ON and OFF are unused in rhythm channels.
        keyOn() { }
        keyOff() { }
    }
    BassDrumChannel.bassDrumChannelBaseAddress = 6;
    BassDrumChannel.op1BaseAddress = 0x10;
    BassDrumChannel.op2BaseAddress = 0x13;
    //
    // OPl3 Data
    //
    class OPL3Data {
        static init() {
            this.loadVibratoTable();
            this.loadTremoloTable();
        }
        static loadVibratoTable() {
            // According to the YMF262 datasheet, the OPL3 vibrato repetition rate is 6.1 Hz.
            // According to the YMF278B manual, it is 6.0 Hz. 
            // The information that the vibrato table has 8 levels standing 1024 samples each
            // was taken from the emulator by Jarek Burczynski and Tatsuyuki Satoh,
            // with a frequency of 6,06689453125 Hz, what  makes sense with the difference 
            // in the information on the datasheets.
            // The first array is used when DVB=0 and the second array is used when DVB=1.
            this.vibratoTable = [new Float32Array(8192), new Float32Array(8192)];
            let semitone = Math.pow(2, 1 / 12);
            // A cent is 1/100 of a semitone:
            let cent = Math.pow(semitone, 1 / 100);
            // When dvb=0, the depth is 7 cents, when it is 1, the depth is 14 cents.
            let DVB0 = Math.pow(cent, 7);
            let DVB1 = Math.pow(cent, 14);
            let i;
            for (i = 0; i < 1024; i++)
                this.vibratoTable[0][i] = this.vibratoTable[1][i] = 1;
            for (; i < 2048; i++) {
                this.vibratoTable[0][i] = Math.sqrt(DVB0);
                this.vibratoTable[1][i] = Math.sqrt(DVB1);
            }
            for (; i < 3072; i++) {
                this.vibratoTable[0][i] = DVB0;
                this.vibratoTable[1][i] = DVB1;
            }
            for (; i < 4096; i++) {
                this.vibratoTable[0][i] = Math.sqrt(DVB0);
                this.vibratoTable[1][i] = Math.sqrt(DVB1);
            }
            for (; i < 5120; i++)
                this.vibratoTable[0][i] = this.vibratoTable[1][i] = 1;
            for (; i < 6144; i++) {
                this.vibratoTable[0][i] = 1 / Math.sqrt(DVB0);
                this.vibratoTable[1][i] = 1 / Math.sqrt(DVB1);
            }
            for (; i < 7168; i++) {
                this.vibratoTable[0][i] = 1 / DVB0;
                this.vibratoTable[1][i] = 1 / DVB1;
            }
            for (; i < 8192; i++) {
                this.vibratoTable[0][i] = 1 / Math.sqrt(DVB0);
                this.vibratoTable[1][i] = 1 / Math.sqrt(DVB1);
            }
        }
        static loadTremoloTable() {
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
                this.calculateIncrement(tremoloDepth[0], 0, 1 / (2 * tremoloFrequency)),
                this.calculateIncrement(tremoloDepth[1], 0, 1 / (2 * tremoloFrequency))
            ];
            let tremoloTableLength = (this.sampleRate / tremoloFrequency) | 0;
            // First array used when AM = 0 and second array used when AM = 1.
            this.tremoloTable = [new Float32Array(13432), new Float32Array(13432)];
            // This is undocumented. The tremolo starts at the maximum attenuation,
            // instead of at 0 dB:
            this.tremoloTable[0][0] = tremoloDepth[0];
            this.tremoloTable[1][0] = tremoloDepth[1];
            let counter = 0;
            // The first half of the triangle waveform:
            while (this.tremoloTable[0][counter] < 0) {
                counter++;
                this.tremoloTable[0][counter] = this.tremoloTable[0][counter - 1] + tremoloIncrement[0];
                this.tremoloTable[1][counter] = this.tremoloTable[1][counter - 1] + tremoloIncrement[1];
            }
            // The second half of the triangle waveform:
            while (this.tremoloTable[0][counter] > tremoloDepth[0] && counter < tremoloTableLength - 1) {
                counter++;
                this.tremoloTable[0][counter] = this.tremoloTable[0][counter - 1] - tremoloIncrement[0];
                this.tremoloTable[1][counter] = this.tremoloTable[1][counter - 1] - tremoloIncrement[1];
            }
        }
        static calculateIncrement(begin, end, period) {
            return (end - begin) / this.sampleRate * (1 / period);
        }
    }
    // OPL3-wide registers offsets:
    OPL3Data._1_NTS1_6_Offset = 0x08;
    OPL3Data.DAM1_DVB1_RYT1_BD1_SD1_TOM1_TC1_HH1_Offset = 0xBD;
    OPL3Data._7_NEW1_Offset = 0x105;
    OPL3Data._2_CONNECTIONSEL6_Offset = 0x104;
    OPL3Data.sampleRate = 49700;
    OPL3Data.init();
    //
    // Channel Data
    // 
    class ChannelData {
    }
    ChannelData._2_KON1_BLOCK3_FNUMH2_Offset = 0xB0;
    ChannelData.FNUML8_Offset = 0xA0;
    ChannelData.CHD1_CHC1_CHB1_CHA1_FB3_CNT1_Offset = 0xC0;
    // Feedback rate in fractions of 2*Pi, normalized to (0,1): 
    // 0, Pi/16, Pi/8, Pi/4, Pi/2, Pi, 2*Pi, 4*Pi turns to be:
    ChannelData.feedback = [0, 1 / 32, 1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2];
    //
    // Operator Data
    //
    class OperatorData {
        static init() {
            OperatorData.loadWaveforms();
        }
        static loadWaveforms() {
            //OPL3 has eight waveforms:
            this.waveforms = [
                new Float32Array(1024), new Float32Array(1024), new Float32Array(1024), new Float32Array(1024),
                new Float32Array(1024), new Float32Array(1024), new Float32Array(1024), new Float32Array(1024)
            ];
            let i;
            // 1st waveform: sinusoid.
            let theta = 0, thetaIncrement = 2 * Math.PI / 1024;
            for (i = 0, theta = 0; i < 1024; i++, theta += thetaIncrement)
                this.waveforms[0][i] = Math.sin(theta);
            let sineTable = this.waveforms[0];
            // 2nd: first half of a sinusoid.
            for (i = 0; i < 512; i++) {
                this.waveforms[1][i] = sineTable[i];
                this.waveforms[1][512 + i] = 0;
            }
            // 3rd: double positive sinusoid.
            for (i = 0; i < 512; i++)
                this.waveforms[2][i] = this.waveforms[2][512 + i] = sineTable[i];
            // 4th: first and third quarter of double positive sinusoid.
            for (i = 0; i < 256; i++) {
                this.waveforms[3][i] = this.waveforms[3][512 + i] = sineTable[i];
                this.waveforms[3][256 + i] = this.waveforms[3][768 + i] = 0;
            }
            // 5th: first half with double frequency sinusoid.
            for (i = 0; i < 512; i++) {
                this.waveforms[4][i] = sineTable[i * 2];
                this.waveforms[4][512 + i] = 0;
            }
            // 6th: first half with double frequency positive sinusoid.
            for (i = 0; i < 256; i++) {
                this.waveforms[5][i] = this.waveforms[5][256 + i] = sineTable[i * 2];
                this.waveforms[5][512 + i] = this.waveforms[5][768 + i] = 0;
            }
            // 7th: square wave
            for (i = 0; i < 512; i++) {
                this.waveforms[6][i] = 1;
                this.waveforms[6][512 + i] = -1;
            }
            // 8th: exponential
            let x;
            let xIncrement = 1 * 16 / 256;
            for (i = 0, x = 0; i < 512; i++, x += xIncrement) {
                this.waveforms[7][i] = Math.pow(2, -x);
                this.waveforms[7][1023 - i] = -Math.pow(2, -(x + 1 / 16));
            }
        }
        static log2(x) {
            return Math.log(x) / Math.log(2);
        }
    }
    OperatorData.AM1_VIB1_EGT1_KSR1_MULT4_Offset = 0x20;
    OperatorData.KSL2_TL6_Offset = 0x40;
    OperatorData.AR4_DR4_Offset = 0x60;
    OperatorData.SL4_RR4_Offset = 0x80;
    OperatorData._5_WS3_Offset = 0xE0;
    OperatorData.waveLength = 1024;
    OperatorData.multTable = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 12, 12, 15, 15];
    OperatorData.ksl3dBtable = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, -3, -6, -9],
        [0, 0, 0, 0, -3, -6, -9, -12],
        [0, 0, 0, -1.875, -4.875, -7.875, -10.875, -13.875],
        [0, 0, 0, -3, -6, -9, -12, -15],
        [0, 0, -1.125, -4.125, -7.125, -10.125, -13.125, -16.125],
        [0, 0, -1.875, -4.875, -7.875, -10.875, -13.875, -16.875],
        [0, 0, -2.625, -5.625, -8.625, -11.625, -14.625, -17.625],
        [0, 0, -3, -6, -9, -12, -15, -18],
        [0, -0.750, -3.750, -6.750, -9.750, -12.750, -15.750, -18.750],
        [0, -1.125, -4.125, -7.125, -10.125, -13.125, -16.125, -19.125],
        [0, -1.500, -4.500, -7.500, -10.500, -13.500, -16.500, -19.500],
        [0, -1.875, -4.875, -7.875, -10.875, -13.875, -16.875, -19.875],
        [0, -2.250, -5.250, -8.250, -11.250, -14.250, -17.250, -20.250],
        [0, -2.625, -5.625, -8.625, -11.625, -14.625, -17.625, -20.625],
        [0, -3, -6, -9, -12, -15, -18, -21]
    ];
    OperatorData.init();
    (function (OperatorData) {
        class type {
        }
        type.NO_MODULATION = 'NO_MODULATION';
        type.CARRIER = 'CARRIER';
        type.FEEDBACK = 'FEEDBACK';
        OperatorData.type = type;
        ;
    })(OperatorData || (OperatorData = {}));
    //
    // Envelope Generator Data
    //
    class EnvelopeGeneratorData {
    }
    // This table is indexed by the value of Operator.ksr 
    // and the value of ChannelRegister.keyScaleNumber.
    EnvelopeGeneratorData.rateOffset = [
        [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    ];
    // These attack periods in miliseconds were taken from the YMF278B manual. 
    // The attack actual rates range from 0 to 63, with different data for 
    // 0%-100% and for 10%-90%: 
    EnvelopeGeneratorData.attackTimeValuesTable = [
        [Infinity, Infinity], [Infinity, Infinity], [Infinity, Infinity], [Infinity, Infinity],
        [2826.24, 1482.75], [2252.80, 1155.07], [1884.16, 991.23], [1597.44, 868.35],
        [1413.12, 741.38], [1126.40, 577.54], [942.08, 495.62], [798.72, 434.18],
        [706.56, 370.69], [563.20, 288.77], [471.04, 247.81], [399.36, 217.09],
        [353.28, 185.34], [281.60, 144.38], [235.52, 123.90], [199.68, 108.54],
        [176.76, 92.67], [140.80, 72.19], [117.76, 61.95], [99.84, 54.27],
        [88.32, 46.34], [70.40, 36.10], [58.88, 30.98], [49.92, 27.14],
        [44.16, 23.17], [35.20, 18.05], [29.44, 15.49], [24.96, 13.57],
        [22.08, 11.58], [17.60, 9.02], [14.72, 7.74], [12.48, 6.78],
        [11.04, 5.79], [8.80, 4.51], [7.36, 3.87], [6.24, 3.39],
        [5.52, 2.90], [4.40, 2.26], [3.68, 1.94], [3.12, 1.70],
        [2.76, 1.45], [2.20, 1.13], [1.84, 0.97], [1.56, 0.85],
        [1.40, 0.73], [1.12, 0.61], [0.92, 0.49], [0.80, 0.43],
        [0.70, 0.37], [0.56, 0.31], [0.46, 0.26], [0.42, 0.22],
        [0.38, 0.19], [0.30, 0.14], [0.24, 0.11], [0.20, 0.11],
        [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]
    ];
    // These decay and release periods in miliseconds were taken from the YMF278B manual. 
    // The rate index range from 0 to 63, with different data for 
    // 0%-100% and for 10%-90%: 
    EnvelopeGeneratorData.decayAndReleaseTimeValuesTable = [
        [Infinity, Infinity], [Infinity, Infinity], [Infinity, Infinity], [Infinity, Infinity],
        [39280.64, 8212.48], [31416.32, 6574.08], [26173.44, 5509.12], [22446.08, 4730.88],
        [19640.32, 4106.24], [15708.16, 3287.04], [13086.72, 2754.56], [11223.04, 2365.44],
        [9820.16, 2053.12], [7854.08, 1643.52], [6543.36, 1377.28], [5611.52, 1182.72],
        [4910.08, 1026.56], [3927.04, 821.76], [3271.68, 688.64], [2805.76, 591.36],
        [2455.04, 513.28], [1936.52, 410.88], [1635.84, 344.34], [1402.88, 295.68],
        [1227.52, 256.64], [981.76, 205.44], [817.92, 172.16], [701.44, 147.84],
        [613.76, 128.32], [490.88, 102.72], [488.96, 86.08], [350.72, 73.92],
        [306.88, 64.16], [245.44, 51.36], [204.48, 43.04], [175.36, 36.96],
        [153.44, 32.08], [122.72, 25.68], [102.24, 21.52], [87.68, 18.48],
        [76.72, 16.04], [61.36, 12.84], [51.12, 10.76], [43.84, 9.24],
        [38.36, 8.02], [30.68, 6.42], [25.56, 5.38], [21.92, 4.62],
        [19.20, 4.02], [15.36, 3.22], [12.80, 2.68], [10.96, 2.32],
        [9.60, 2.02], [7.68, 1.62], [6.40, 1.35], [5.48, 1.15],
        [4.80, 1.01], [3.84, 0.81], [3.20, 0.69], [2.74, 0.58],
        [2.40, 0.51], [2.40, 0.51], [2.40, 0.51], [2.40, 0.51]
    ];
})(Lemmings || (Lemmings = {}));
/// <reference path="opl3.ts"/>
/// <reference path="./../sound-image-player.ts"/>
var Lemmings;
(function (Lemmings) {
    class AudioPlayer {
        constructor(src) {
            this.error = new Lemmings.ErrorHandler("AudioPlayer");
            this.queue = []; //Float32Array[] = [];
            this.PCM_FRAME_SIZE = 64 * 4;
            this.FRAMES_IN_OUTBUFFER = 32;
            /** is the sound playing at the moment */
            this.isPlaying = false;
            this.opl = new Lemmings.OPL3();
            this.srcOplPlayer = src;
            /// setup audio context
            this.context = new AudioContext();
            this.source = this.context.createBufferSource();
            this.processor = this.context.createScriptProcessor(this.FRAMES_IN_OUTBUFFER * this.PCM_FRAME_SIZE, 0, 2);
            this.gain = this.context.createGain();
            this.silence = new Float32Array(this.PCM_FRAME_SIZE);
            this.gain.gain.value = 1;
        }
        /** fill the cache with data */
        readAdlib() {
            if (!this.isPlaying)
                return;
            var startTime = window.performance.now();
            /// fill the buffer with 100 PCM blocks
            while (this.queue.length < 300) {
                /// read on music-bar from source file
                this.srcOplPlayer.read((reg, value) => {
                    /// write Adlib-Commands
                    this.opl.write(0, reg, value);
                });
                /// Render the adlib commands to PCM Sound
                ///  => to get the right speed we need to sampel about (64 * 6) to (64 * 8) values for Lemmings
                this.queue.push(this.opl.readMonoLemmings(this.PCM_FRAME_SIZE));
                this.queue.push(this.opl.readMonoLemmings(this.PCM_FRAME_SIZE));
            }
            //this.error.debug("Elapsed Time for sampling opl "+ (window.performance.now() - startTime));
            /// periodically process new data 
            window.setTimeout(() => {
                this.readAdlib();
            }, 100);
        }
        /** Start playback of the song/sound */
        play() {
            this.isPlaying = true;
            /// read and buffer PCM block
            this.readAdlib();
            /// setup Web-Audio
            this.processor.onaudioprocess = (e) => this.audioScriptProcessor(e);
            this.source.connect(this.processor);
            this.processor.connect(this.gain);
            this.gain.connect(this.context.destination);
            /// delay the playback
            window.setTimeout(() => {
                /// only start if not stopped so fare
                if ((this.source) && (this.isPlaying)) {
                    this.source.start();
                }
            }, 500);
        }
        /** stop playing and close */
        stop() {
            if (this.isPlaying) {
                this.isPlaying = false;
                try {
                    this.source.stop();
                }
                catch (ex) { }
            }
            try {
                this.context.close();
            }
            catch (ex) { }
            if (this.processor) {
                this.processor.onaudioprocess = null;
            }
            try {
                this.source.disconnect(this.processor);
                this.processor.disconnect(this.gain);
                this.gain.disconnect(this.context.destination);
            }
            catch (ex) { }
            this.context = null;
            this.source = null;
            this.processor = null;
            this.gain = null;
            this.opl = null;
            this.srcOplPlayer = null;
        }
        audioScriptProcessor(e) {
            //this.error.log("queue.length: "+ this.queue.length);
            if (!this.isPlaying)
                return;
            let outputBuffer = e.outputBuffer;
            let offset = 0;
            for (let i = 0; i < this.FRAMES_IN_OUTBUFFER; i++) {
                var pcmFrame = null;
                if (this.queue.length > 0) {
                    /// read from FiFo buffer
                    pcmFrame = this.queue.shift();
                }
                /// use silence on error
                if (!pcmFrame) {
                    /// no data ->
                    pcmFrame = this.silence;
                    this.error.log("Out of Data!");
                    return;
                }
                /// copy PCM bloack to out buffer
                outputBuffer.copyToChannel(pcmFrame, 0, offset); /// left
                outputBuffer.copyToChannel(pcmFrame, 1, offset); /// right
                offset += pcmFrame.length;
            }
        }
    }
    Lemmings.AudioPlayer = AudioPlayer;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    class DebugView {
        constructor() {
            this.levelIndex = 0;
            this.levelGroupIndex = 0;
            this.musicIndex = 0;
            this.soundIndex = 0;
            this.gameResources = null;
            this.musicPlayer = null;
            this.soundPlayer = null;
            this.gameFactory = new Lemmings.GameFactory("./");
            this.display = null;
            this.controller = null;
            this.elementSoundNumber = null;
            this.elementTrackNumber = null;
            this.elementLevelNumber = null;
            this.elementSelectedGame = null;
            this.elementSelectLevelGroup = null;
            this.elementLevelName = null;
            this._gameCanvas = null;
        }
        set gameCanvas(el) {
            this._gameCanvas = el;
            this.controller = new Lemmings.GameController(el);
            this.display = new Lemmings.GameDisplay(el);
            this.controller.onViewPointChanged = (viewPoint) => {
                this.display.setViewPoint(viewPoint);
            };
        }
        playMusic(moveInterval) {
            this.stopMusic();
            if (!this.gameResources)
                return;
            if (moveInterval == null)
                moveInterval = 0;
            this.musicIndex += moveInterval;
            this.musicIndex = (this.musicIndex < 0) ? 0 : this.musicIndex;
            if (this.elementTrackNumber) {
                this.elementTrackNumber.innerHTML = this.musicIndex.toString();
            }
            this.gameResources.getMusicPlayer(this.musicIndex)
                .then((player) => {
                this.musicPlayer = player;
                this.musicPlayer.play();
            });
        }
        stopMusic() {
            if (this.musicPlayer) {
                this.musicPlayer.stop();
                this.musicPlayer = null;
            }
        }
        stopSound() {
            if (this.soundPlayer) {
                this.soundPlayer.stop();
                this.soundPlayer = null;
            }
        }
        playSound(moveInterval) {
            this.stopSound();
            if (moveInterval == null)
                moveInterval = 0;
            this.soundIndex += moveInterval;
            this.soundIndex = (this.soundIndex < 0) ? 0 : this.soundIndex;
            if (this.elementSoundNumber) {
                this.elementSoundNumber.innerHTML = this.soundIndex.toString();
            }
            this.gameResources.getSoundPlayer(this.soundIndex)
                .then((player) => {
                this.soundPlayer = player;
                this.soundPlayer.play();
            });
        }
        moveToLevel(moveInterval) {
            if (moveInterval == null)
                moveInterval = 0;
            this.levelIndex += moveInterval;
            this.levelIndex = (this.levelIndex < 0) ? 0 : this.levelIndex;
            if (this.elementLevelNumber) {
                this.elementLevelNumber.innerHTML = (this.levelIndex + 1).toString();
            }
            this.loadLevel();
        }
        clearHtmlList(htmlList) {
            while (htmlList.options.length) {
                htmlList.remove(0);
            }
        }
        arrayToSelect(htmlList, list) {
            this.clearHtmlList(htmlList);
            for (var i = 0; i < list.length; i++) {
                var opt = list[i];
                var el = document.createElement("option");
                el.textContent = opt;
                el.value = i.toString();
                htmlList.appendChild(el);
            }
        }
        selectLevelGroup(newLevelGroupIndex) {
            this.levelGroupIndex = newLevelGroupIndex;
            this.loadLevel();
        }
        selectGame(gameTypeName) {
            if (gameTypeName == null)
                gameTypeName = "LEMMINGS";
            let gameType = Lemmings.GameTypes.fromString(gameTypeName);
            this.gameFactory.getGameResources(gameType)
                .then((newGameResources) => {
                this.gameResources = newGameResources;
                this.arrayToSelect(this.elementSelectLevelGroup, this.gameResources.getLevelGroups());
                this.levelGroupIndex = 0;
                this.loadLevel();
            });
        }
        loadLevel() {
            if (this.gameResources == null)
                return;
            this.gameResources.getLevel(this.levelGroupIndex, this.levelIndex)
                .then((level) => {
                if (level == null)
                    return;
                if (this.elementLevelName) {
                    this.elementLevelName.innerHTML = level.name;
                }
                if (this.display != null) {
                    this.display.render(level);
                }
                this.controller.SetViewRange(0, 0, level.width, level.height);
                console.dir(level);
            });
        }
    }
    Lemmings.DebugView = DebugView;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** handel the display of the game */
    class GameController {
        constructor(listenElement) {
            this.listenElement = listenElement;
            this.mouseDownX = -1;
            this.mouseDownY = -1;
            this.mouseDownButton = -1;
            this.viewX = 0;
            this.viewY = 0;
            this.viewScale = 1;
            this.mouseDownViewX = 0;
            this.mouseDownViewY = 0;
            this.minX = 0;
            this.minY = 0;
            this.maxX = 0;
            this.maxY = 0;
            listenElement.addEventListener("mousemove", (e) => {
                this.HandelMouseMove(e.clientX, e.clientY);
            });
            listenElement.addEventListener("touchmove", (e) => {
                this.HandelMouseMove(e.touches[0].clientX, e.touches[0].clientY);
            });
            listenElement.addEventListener("touchstart", (e) => {
                this.HandelMouseDown(e.touches[0].clientX, e.touches[0].clientY, 0, e.currentTarget);
            });
            listenElement.addEventListener("mousedown", (e) => {
                this.HandelMouseDown(e.clientX, e.clientY, e.button, e.currentTarget);
            });
            listenElement.addEventListener("mouseup", (e) => {
                this.HandelMouseUp();
            });
            listenElement.addEventListener("mouseleave", (e) => {
                this.HandelMouseUp();
            });
            listenElement.addEventListener("touchend", (e) => {
                this.HandelMouseUp();
            });
            listenElement.addEventListener("touchleave", (e) => {
                this.HandelMouseUp();
            });
            listenElement.addEventListener("touchcancel", (e) => {
                this.HandelMouseUp();
            });
            listenElement.addEventListener("wheel", (e) => {
                this.HandeWheel(e);
            });
        }
        SetViewRange(minX, minY, maxX, maxY) {
            this.minX = minX;
            this.minY = minY;
            this.maxX = maxX;
            this.maxY = maxY;
        }
        HandelMouseMove(x, y) {
            //- Move Point of View
            if (this.mouseDownButton == 0) {
                this.viewX = this.mouseDownViewX + (this.mouseDownX - x) / this.viewScale;
                this.viewY = this.mouseDownViewY + (this.mouseDownY - y) / this.viewScale;
                this.viewX = Math.min(this.viewX, this.maxX);
                this.viewX = Math.max(this.viewX, this.minX);
                this.viewY = Math.min(this.viewY, this.maxY);
                this.viewY = Math.max(this.viewY, this.minY);
                this.onViewPointChanged(new Lemmings.ViewPoint(this.viewX, this.viewY, this.viewScale));
            }
        }
        HandelMouseDown(x, y, button, currentTarget) {
            //- save start of Mousedown
            this.mouseDownViewX = this.viewX;
            this.mouseDownViewY = this.viewY;
            this.mouseDownX = x;
            this.mouseDownY = y;
            this.mouseDownButton = button;
        }
        HandelMouseUp() {
            this.mouseDownX = -1;
            this.mouseDownY = -1;
            this.mouseDownButton = -1;
        }
        HandeWheel(e) {
            //- Zoom view?
            if (e.deltaY > 0) {
                this.viewScale += 0.5;
                if (this.viewScale > 10)
                    this.viewScale = 10;
            }
            if (e.deltaY < 0) {
                this.viewScale -= 0.5;
                if (this.viewScale < 0.5)
                    this.viewScale = 0.5;
            }
            this.onViewPointChanged(new Lemmings.ViewPoint(this.viewX, this.viewY, this.viewScale));
        }
    }
    Lemmings.GameController = GameController;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** handel the display of the game */
    class GameDisplay {
        constructor(canvasForOutput) {
            this.viewPoint = new Lemmings.ViewPoint(0, 0, 1);
            this.contentWidth = 0;
            this.contentHeight = 0;
            this.outputCav = canvasForOutput;
            this.processCav = document.createElement('canvas');
        }
        setViewPoint(viewPoint) {
            this.viewPoint = viewPoint;
            this.redraw();
        }
        render(level) {
            this.contentWidth = level.width;
            this.contentHeight = level.height;
            this.processCav.width = level.width;
            this.processCav.height = level.height;
            var backCtx = this.processCav.getContext("2d");
            /// create image
            var imgData = backCtx.createImageData(level.width, level.height);
            /// set pixels
            imgData.data.set(level.groundImage);
            /// write image to context
            backCtx.putImageData(imgData, 0, 0);
            this.redraw();
        }
        redraw() {
            var cav = this.outputCav;
            var ctx = cav.getContext("2d");
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;
            let outGameH = cav.height;
            let outW = cav.width;
            let viewScale = this.viewPoint.scale;
            let viewX = this.viewPoint.x;
            let viewY = this.viewPoint.y;
            //- Display Layers
            var dW = this.contentWidth - viewX; //- display width
            if ((dW * viewScale) > outW) {
                dW = outW / viewScale;
                //game.viewScale = outW / dW;
            }
            var dH = this.contentHeight - viewY; //- display height
            if ((dH * viewScale) > outGameH) {
                dH = outGameH / viewScale;
                //game.viewScale = outH / dH;
            }
            //- drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)
            ctx.drawImage(this.processCav, viewX, viewY, dW, dH, 0, 0, dW * viewScale, dH * viewScale);
        }
    }
    Lemmings.GameDisplay = GameDisplay;
})(Lemmings || (Lemmings = {}));
var Lemmings;
(function (Lemmings) {
    /** View Point to display the game */
    class ViewPoint {
        constructor(x, y, scale) {
            this.x = x;
            this.y = y;
            this.scale = scale;
        }
    }
    Lemmings.ViewPoint = ViewPoint;
})(Lemmings || (Lemmings = {}));
//# sourceMappingURL=lemmings.js.map