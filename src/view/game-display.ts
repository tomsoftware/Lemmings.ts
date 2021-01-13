import { Game } from '../game';
import { CommandLemmingsAction } from '../game-play/commands/command-lemming-action';
import { LemmingManager } from '../game-play/lemming-manager';
import { ObjectManager } from '../game-play/object-manager';
import { TriggerManager } from '../game-play/trigger-manager';
import { Level } from '../resources/level';
import { DisplayImage } from './display-image';

export class GameDisplay {

    private display?: DisplayImage;

    constructor(
        private game: Game,
        private level: Level,
        private lemmingManager: LemmingManager,
        private objectManager: ObjectManager,
        private triggerManager: TriggerManager) {
    }


    public setGuiDisplay(display: DisplayImage) {
        this.display = display;

        this.display.onMouseDown.on((e) => {
            if (!e) {
                return;
            }

            //console.log(e.x +' '+ e.y);
            let lem = this.lemmingManager.getLemmingAt(e.x, e.y);
            if (!lem) {
                return;
            }

            this.game.queueCommand(new CommandLemmingsAction(lem.id));
        });
    }


    public render() {
        if (!this.display) {
            return;
        }

        this.level.render(this.display);

        this.objectManager.render(this.display);

        this.lemmingManager.render(this.display);
    }


    public renderDebug() {
        if (!this.display) {
            return;
        }

        this.lemmingManager.renderDebug(this.display);
        this.triggerManager.renderDebug(this.display);
    }

}
