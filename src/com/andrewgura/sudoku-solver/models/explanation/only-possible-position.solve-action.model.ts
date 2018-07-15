import { ActionTypeEnum } from '../../enums/action-type.enum';
import SolveActionModel from './solve-action.model';
import CellPositionModel from '../cell-position.model';
import { CellSetTypeEnum } from '../../enums/cell-set-type.enum';

export default class OnlyPossiblePositionSolveActionModel extends SolveActionModel {

    private static SCOPE_ACTION_TYPE_MAP: any = {
        'Row': ActionTypeEnum.TheOnlyPossiblePositionInRow,
        'Column': ActionTypeEnum.TheOnlyPossiblePositionInColumn,
        'Cell': ActionTypeEnum.TheOnlyPossiblePositionInCell,
    };

    private readonly scope: CellSetTypeEnum;

    constructor(
        scope: CellSetTypeEnum,
        cellPosition: CellPositionModel,
        foundValue: number,
        affectingCells: CellPositionModel[],
        sudokuStateAfterAction: string
    ) {
        super(
            OnlyPossiblePositionSolveActionModel.SCOPE_ACTION_TYPE_MAP[ scope ],
            cellPosition,
            foundValue,
            affectingCells,
            sudokuStateAfterAction
        );
        this.scope = scope;
    }

    toString(): string {
        return `Cell ${this.cellPosition.toString()} is the only one possible position for value ${this.foundValue} in ${this.scope}`;
    }

}