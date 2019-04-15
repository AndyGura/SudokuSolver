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

    public static getAllValues(): number[] {
        return SudokuUtils.allValues.slice();
    }

    public static calculateAllCellsPossibleValues(sudoku: Sudoku): void {
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                SudokuUtils.calculateCellPossibleValues(sudoku, i, j);
            }
        }
    }

    public static calculateCellPossibleValues(sudoku: Sudoku, i: number, j: number): void {
        let cell: SudokuCell = sudoku.cells[ i ][ j ];
        if ( cell.value > 0 ) {
            cell.possibleValuesHash.fromArray([ cell.value ]);
            return;
        }
        // AG: faster than searching in sets, leave it as it is
        const disallowedValues: Set<number> = new Set<number>();
        for (let i = 0; i < cell.cellSets.length; i++) {
            const cellSet: SudokuCellSetModel = cell.cellSets[ i ];
            for (let j = 0; j < cellSet.cells.length; j++) {
                const anotherCell: SudokuCell = cellSet.cells[ j ];
                if ( anotherCell.value > 0 ) {
                    disallowedValues.add(anotherCell.value);
                }
            }
        }
        cell.possibleValuesHash.fromArray(SudokuUtils.allValues.filter(value => !disallowedValues.has(value)));
    }

}
