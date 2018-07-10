import { SudokuCellStatus } from '../enums/sudoku-cell-status.enum';
import SudokuCellSetModel from './sudoku-cell-set.model';

export class SudokuCell {

    private _value: number = 0;
    public status: SudokuCellStatus = SudokuCellStatus.Undefined;
    public possibleValues: number[] = [];
    public cellSets: SudokuCellSetModel[];

    public get value(): number {
        return this._value;
    }

    public set value(value: number) {
        value = (!isNaN(value) && value > 0 && value < 10) ? Math.round(value) : 0;
        this.possibleValues = [];
        this._value = value;
    }

    constructor(value: number = 0) {
        this.value = value;
        this.status = (value > 0) ? SudokuCellStatus.Set : SudokuCellStatus.Undefined;
    }

    public isSet(): boolean {
        return this.status === SudokuCellStatus.Set;
    }

    public isError(): boolean {
        return this.status === SudokuCellStatus.Error;
    }

    public isUndefined(): boolean {
        return this.status === SudokuCellStatus.Undefined;
    }

    public clone(): SudokuCell {
        const newCell: SudokuCell = new SudokuCell(this.value);
        newCell.status = this.status;
        newCell.possibleValues = this.possibleValues;
        newCell.cellSets = this.cellSets;
        return newCell;
    }

}
