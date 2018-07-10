import { Sudoku } from '../models/sudoku.model';
import { SudokuError } from '../errors/sudoku.error';
import { SudokuCell } from '../models/sudoku-cell.model';
import SudokuCellSetModel from '../models/sudoku-cell-set.model';
import SudokuUtils from '../utils/sudoku.utils';

// TODO optimize it. Only result matters here
export default class QuickSolveService {

    public static solve(sudoku: Sudoku): void {
        // first, lets calculate the matrix of possible values
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                SudokuUtils.calculateCellPossibleValues(sudoku, i, j);
            }
        }
        let atLeastOneEmpty: boolean = true;
        let atLeastOneFoundOnLastIteration: boolean = true;
        while (atLeastOneEmpty && atLeastOneFoundOnLastIteration) {
            atLeastOneEmpty = false;
            atLeastOneFoundOnLastIteration = false;
            // 1. find the only possible numbers in the cell
            for (let i: number = 0; i < 9; i++) {
                for (let j: number = 0; j < 9; j++) {
                    let cell: SudokuCell = sudoku.cells[ i ][ j ];
                    if ( cell.value > 0 ) {
                        continue;
                    }
                    if ( cell.possibleValues.length === 1 ) {
                        sudoku.writeCalculatedValue(i, j, cell.possibleValues[ 0 ]);
                        atLeastOneFoundOnLastIteration = true;
                    } else {
                        if ( cell.possibleValues.length === 0 ) {
                            throw new SudokuError(1, 'Sudoku doesn\'t have any solution');
                        }
                        atLeastOneEmpty = true;
                    }
                }
            }
            // 2. search possible positions of number
            for (let n: number = 1; n < 10; n++) {
                for (let i: number = 0; i < sudoku.cellSets.length; i++) {
                    const cellSet: SudokuCellSetModel = sudoku.cellSets[ i ];
                    let isNumberPresented: boolean = false;
                    for (let j: number = 0; j < 9; j++) {
                        if ( cellSet.cells[ j ].value === n ) {
                            isNumberPresented = true;
                            break;
                        }
                    }
                    if ( !isNumberPresented ) {
                        let possiblePositions: number[] = [];
                        for (let j: number = 0; j < 9; j++) {
                            if ( cellSet.cells[ j ].value === 0 && cellSet.cells[ j ].possibleValues.indexOf(n) > -1 ) {
                                possiblePositions.push(j);
                            }
                        }
                        if ( possiblePositions.length === 1 ) {
                            const pos: { x: number, y: number } = cellSet.getCellCoordinates(possiblePositions[ 0 ]);
                            sudoku.writeCalculatedValue(pos.x, pos.y, n);
                            atLeastOneFoundOnLastIteration = true;
                        }
                    }
                }
            }
        }
        if ( !atLeastOneFoundOnLastIteration && atLeastOneEmpty ) {
            // few possible solutions. Let's check them recursively
            let i: number = 0;
            let j: number = 0;
            outer:
                for (i = 0; i < 9; i++) {
                    for (j = 0; j < 9; j++) {
                        if ( sudoku.cells[ i ][ j ].value === 0 ) {
                            break outer;
                        }
                    }
                }
            let valuesToCheck: any[] = [];
            for (let k: number = 0; k < sudoku.cells[ i ][ j ].possibleValues.length; k++) {
                valuesToCheck.push({
                    value: sudoku.cells[ i ][ j ].possibleValues[ k ],
                    result: null
                });
            }
            let solutionsCounter: number = 0;
            let anySolution: any = {
                value: 0,
                result: null
            };
            let testSudoku: Sudoku;
            for (let testValue of valuesToCheck) {
                testSudoku = sudoku.clone();
                testValue.result = testSudoku;
                testSudoku.writeCalculatedValue(i, j, testValue.value);
                try {
                    testSudoku.solve();
                    anySolution = testValue;
                    solutionsCounter++;
                } catch (err) {
                    // if recursive solver said that sudoku has more than one solution, it is true
                    if ( (err as SudokuError).code === 2 ) {
                        throw err;
                    }
                }
                if ( solutionsCounter > 1 ) {
                    throw new SudokuError(2, 'Sudoku has more than one solution');
                }
            }
            if ( solutionsCounter === 0 ) {
                throw new SudokuError(1, 'Sudoku doesn\'t have any solution');
            } else {
                sudoku.copyFrom(anySolution.result);
            }
        }
    }

}