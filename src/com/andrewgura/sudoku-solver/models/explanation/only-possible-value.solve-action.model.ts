import { ActionTypeEnum } from '../../enums/action-type.enum';
import SolveActionModel from './solve-action.model';
import CellPositionModel from '../cell-position.model';

export default class OnlyPossibleValueSolveActionModel extends SolveActionModel {

    constructor(cellPosition: CellPositionModel, foundValue: number, affectingCells: CellPositionModel[]) {
        super(ActionTypeEnum.TheOnlyPossibleValue, cellPosition, foundValue, affectingCells);
    }

    toString(): string {
        return `Cell ${this.cellPosition.toString()} has the only one possible value ${this.foundValue}`;
    }

}