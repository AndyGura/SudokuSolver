import { ActionTypeEnum } from '../../enums/action-type.enum';
import CellPositionModel from '../cell-position.model';

export default abstract class SolveActionModel {

    protected constructor(
        public actionType: ActionTypeEnum,
        public cellPosition: CellPositionModel,
        public foundValue: number,
        public affectingCells: CellPositionModel[],
        public sudokuStateAfterAction: string
    ) {
    }

    abstract toString(): string

}