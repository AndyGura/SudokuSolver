import { ActionTypeEnum } from '../../enums/action-type.enum';
import SolveActionModel from './solve-action.model';
import CellPositionModel from '../cell-position.model';

export default class RecursiveSolveActionModel extends SolveActionModel {

    constructor(cellPosition: CellPositionModel, foundValue: number) {
        super(ActionTypeEnum.RecursiveResult, cellPosition, foundValue, []);
    }

    toString(): string {
        return `Sudoku can be solved only if cell ${this.cellPosition.toString()} has value ${this.foundValue}`;
    }

}