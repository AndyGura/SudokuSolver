export default class CellPositionModel {

    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public toString(): string {
        return `(${this.x + 1}, ${this.y + 1})`;
    }

}