
export interface IOpl3 {
    generate(lenSamples: number): any;
    write(reg: number, val: number): void;
}

