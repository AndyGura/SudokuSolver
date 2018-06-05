import { ActionTypeEnum } from '../../enums/action-type.enum';
import CellPositionModel from '../cell-position.model';

export default abstract class SolveActionModel {

    public actionType: ActionTypeEnum;
    public cellPosition: CellPositionModel;
    public foundValue: number;
    public affectingCells: CellPositionModel[];

    protected constructor(actionType: ActionTypeEnum, cellPosition: CellPositionModel, foundValue: number,
                          affectingCells: CellPositionModel[]) {
        this.actionType = actionType;
        this.cellPosition = cellPosition;
        this.foundValue = foundValue;
        this.affectingCells = affectingCells;
    }

    abstract toString(): string

}