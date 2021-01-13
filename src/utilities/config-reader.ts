import { GameConfig } from '../config/game-config';
import { GameTypes, GameTypesHelper } from '../game-types';
import { LogHandler } from './log-handler';

/** read the config.json file */
export class ConfigReader {

    private configs: Promise<GameConfig[]>;
    private log: LogHandler = new LogHandler('ConfigReader');


    constructor(configFile: Promise<string>) {

        this.configs = new Promise<GameConfig[]>((resolve) => {

            configFile.then((jsonString) => {

                const configJson: GameConfig[] = this.parseConfig(jsonString);

                resolve(configJson);
            }
            );
        });

    }


    /** return the game config for a given GameType */
    public async getConfig(gameType: GameTypes): Promise<GameConfig | undefined> {


        const configs = await this.configs;

        const config = configs.find((type) => type.gameType == gameType);

        if (!config) {
            this.log.log('config for GameTypes:' + GameTypesHelper.toString(gameType) + ' not found!');
            return;
        }

        return config;

    }


    /** pars the config file */
    private parseConfig(jsonData: string): GameConfig[] {

        const gameConfigs: GameConfig[] = [];
        let config: any[];

        try {
            config = <any[]>JSON.parse(jsonData);
        } catch (e) {
            this.log.log('Unable to parse config', e);
            return gameConfigs;
        }

        /// for all game types
        for (let c = 0; c < config.length; c++) {
            const newConfig = new GameConfig();
            const configData: { [key: string]: string } = config[c];

            newConfig.name = configData['name'];
            newConfig.path = configData['path'];
            newConfig.gameType = GameTypesHelper.fromString(configData['gametype']);

            /// read level config
            if (configData['level.useoddtable'] != null) {
                newConfig.level.useOddTable = (!!(<any>configData['level.useoddtable']));
            }
            newConfig.level.order = <any>configData['level.order'];
            newConfig.level.filePrefix = <any>configData['level.filePrefix'];
            newConfig.level.groups = <any>configData['level.groups'];

            /// read audio config
            newConfig.audioConfig.version = <any>configData['audio.version'];
            newConfig.audioConfig.adlibChannelConfigPosition = <any>configData['audio.adlibChannelConfigPosition'];
            newConfig.audioConfig.dataOffset = <any>configData['audio.dataOffset'];
            newConfig.audioConfig.frequenciesOffset = <any>configData['audio.frequenciesOffset'];
            newConfig.audioConfig.octavesOffset = <any>configData['audio.octavesOffset'];
            newConfig.audioConfig.frequenciesCountOffset = <any>configData['audio.frequenciesCountOffset'];

            newConfig.audioConfig.instructionsOffset = <any>configData['audio.instructionsOffset'];
            newConfig.audioConfig.soundIndexTablePosition = <any>configData['audio.soundIndexTablePosition'];
            newConfig.audioConfig.soundDataOffset = <any>configData['audio.soundDataOffset'];
            newConfig.audioConfig.numberOfTracks = <any>configData['audio.numberOfTracks'];

            gameConfigs.push(newConfig);
        }

        return gameConfigs;

    }

}
