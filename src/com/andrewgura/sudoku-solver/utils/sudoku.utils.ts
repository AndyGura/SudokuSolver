import { Sudoku } from '../models/sudoku.model';
import { SudokuCell } from '../models/sudoku-cell.model';
import SudokuCellSetModel from '../models/sudoku-cell-set.model';

export default class SudokuUtils {

    private static allValues: number[] = ((count: number): number[] => {
        const result: number[] = [];
        for (let i = 1; i <= count; i++) {
            result.push(i);
        }
        return result;
    })(9);

    public static getAllValues(count: number = 9): number[] {
        return SudokuUtils.allValues.slice();
    }

    public static calculateCellPossibleValues(sudoku: Sudoku, i: number, j: number): void {
        let cell: SudokuCell = sudoku.cells[ i ][ j ];
        if ( cell.value > 0 ) {
            cell.possibleValues = [ cell.value ];
            return;
        }
        const disallowedValues: Set<number> = new Set<number>();
        for (let i = 0; i < cell.cellSets.length; i++) {
            const cellSet: SudokuCellSetModel = cell.cellSets[i];
            for (let j = 0; j < cellSet.cells.length; j++) {
                const anotherCell: SudokuCell = cellSet.cells[j];
                if ( anotherCell.value > 0 ) {
                    disallowedValues.add(anotherCell.value);
                }
            }
        }
        cell.possibleValues = SudokuUtils.allValues.filter(value => !disallowedValues.has(value));
    }

}