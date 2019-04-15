import SudokuCellSetModel from './sudoku-cell-set.model';
import {SudokuCell} from './sudoku-cell.model';

export default class EntanglementModel {
    constructor(
        public cellSet: SudokuCellSetModel,
        public cells: SudokuCell[],
        public values: number[],
    ) {
        if (values.length !== cells.length) {
            throw new Error('In entanglement values.length must be equal to cells.length')
        }
        if (values.length < 2) {
            throw new Error('Entanglement cannot have less than 2 items')
        }
    }

}
