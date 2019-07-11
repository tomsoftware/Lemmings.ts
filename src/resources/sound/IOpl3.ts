namespace Lemmings {
    export interface IOpl3 {
        generate(lenSamples:number):any;
        write(reg:number, val:number):void;
    }

    export enum OplEmulatorType{
        Dosbox = 0,
        Cozendey = 1
    }
}