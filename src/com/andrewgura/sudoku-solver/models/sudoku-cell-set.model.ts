import { SudokuCell } from './sudoku-cell.model';
import { CellSetTypeEnum } from '../enums/cell-set-type.enum';
import CellPositionModel from './cell-position.model';
import AppUtils from '../utils/app.utils';

export default class SudokuCellSetModel {

    public setType: CellSetTypeEnum;
    public index: number;
    public cells: SudokuCell[] = [];

    public presentedValues: Set<number>;
    public missedValues: Set<number>;

    constructor(setType: CellSetTypeEnum, index: number) {
        this.setType = setType;
        this.index = index;
        this.presentedValues = new Set<number>();
        this.missedValues = new Set<number>();
        for (let i = 1; i <= 9; i++) {
            this.missedValues.add(i);
        }
    }

    public getCellCoordinates(cellLocalIndex: number): CellPositionModel {
        switch (this.setType) {
            case CellSetTypeEnum.Row:
                return new CellPositionModel(this.index, cellLocalIndex);
            case CellSetTypeEnum.Column:
                return new CellPositionModel(cellLocalIndex, this.index);
            case CellSetTypeEnum.Cell:
                const thisPos: { x: number, y: number } = AppUtils.fromCellNumeration(this.index);
                const cellPos: { x: number, y: number } = AppUtils.fromCellNumeration(cellLocalIndex);
                return {
                    x: thisPos.x * 3 + cellPos.x,
                    y: thisPos.y * 3 + cellPos.y
                };
        }
    }

    public onCellValueSet(cell: SudokuCell, value: number): void {
        this.presentedValues.add(value);
        this.missedValues.delete(value);
        for (let i = 0; i < this.cells.length; i++) {
            const anotherCell: SudokuCell = this.cells[ i ];
            if ( anotherCell.value > 0 || cell === anotherCell ) {
                continue;
            }
            const index: number = anotherCell.possibleValues.indexOf(value);
            if ( index > -1 ) {
                anotherCell.possibleValues.splice(index, 1);
            }
        }
    }

    public onCellValueUnset(cell: SudokuCell, oldValue: number): void {
        this.missedValues.add(oldValue);
        this.presentedValues.delete(oldValue);
        for (let i = 0; i < this.cells.length; i++) {
            const anotherCell: SudokuCell = this.cells[ i ];
            if ( anotherCell.value > 0 || cell === anotherCell ) {
                continue;
            }
            anotherCell.possibleValues.push(oldValue);
        }
    }

}