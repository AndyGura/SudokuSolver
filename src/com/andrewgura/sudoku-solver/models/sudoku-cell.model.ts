import { SudokuCellStatus } from '../enums/sudoku-cell-status.enum';
import SudokuCellSetModel from './sudoku-cell-set.model';
import SudokuUtils from '../utils/sudoku.utils';

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
        if ( value > 0 ) {
            if ( !this.cellSets ) {
                throw new Error('Trying to set value to sudoku cell while it is not attached to any cell set');
            }
            this.possibleValues = [];
            if ( this._value > 0 ) {
                for (let i: number = 0; i < this.cellSets.length; i++) {
                    this.cellSets[ i ].onCellValueUnset(this, this._value);
                }
            }
            for (let i: number = 0; i < this.cellSets.length; i++) {
                this.cellSets[ i ].onCellValueSet(this, value);
            }
        } else {
            this.possibleValues = SudokuUtils.getAllValues();
            if ( this.cellSets && this._value > 0 ) {
                for (let i: number = 0; i < this.cellSets.length; i++) {
                    this.cellSets[ i ].onCellValueUnset(this, this._value);
                }
            }
        }
        this._value = value;
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

}
