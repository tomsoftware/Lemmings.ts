export class LevelConfig {

    /** file Prefix used in the filename of the level-file */
    public filePrefix: string = "LEVEL";

    /** use the odd-table-file */
    public useOddTable: boolean = false;

    /** the names of the level groups */
    public groups: string[] = [];

    /** sort order of the levels for each group
     *   every entry is a number where: 
     *     ->  (FileId * 10 + FilePart) * (useOddTableEntry? -1 : 1)
     */
    public order: number[][] = [];

    public getGroupLength(groupIndex: number): number {
        if ((groupIndex < 0) || (groupIndex > this.order.length)) {
            return 0;
        }

        return this.order[groupIndex].length;
    }
}
