import { SudokuCell } from './sudoku-cell.model';
import { CellSetTypeEnum } from '../enums/cell-set-type.enum';
import CellPositionModel from './cell-position.model';
import AppUtils from '../utils/app.utils';

export default class SudokuCellSetModel {

    public setType: CellSetTypeEnum;
    public index: number;
    public cells: SudokuCell[] = [];

    constructor(setType: CellSetTypeEnum, index: number) {
        this.setType = setType;
        this.index = index;
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

}