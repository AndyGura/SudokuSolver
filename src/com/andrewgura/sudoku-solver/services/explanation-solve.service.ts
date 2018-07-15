import { Sudoku } from '../models/sudoku.model';
import { SudokuError } from '../errors/sudoku.error';
import { SudokuCell } from '../models/sudoku-cell.model';
import { SudokuCellStatus } from '../enums/sudoku-cell-status.enum';
import SolveActionModel from '../models/explanation/solve-action.model';
import OnlyPossibleValueSolveActionModel from '../models/explanation/only-possible-value.solve-action.model';
import OnlyPossiblePositionSolveActionModel from '../models/explanation/only-possible-position.solve-action.model';
import RecursiveSolveActionModel from '../models/explanation/recursive.solve-action.model';
import CellPositionModel from '../models/cell-position.model';
import SudokuCellSetModel from '../models/sudoku-cell-set.model';
import SudokuUtils from '../utils/sudoku.utils';

export default class ExplanationSolveService {

    public static solve(sudoku: Sudoku): SolveActionModel[] {
        const result: SolveActionModel[] = [];
        // first, lets calculate the matrix of possible values
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                SudokuUtils.calculateCellPossibleValues(sudoku, i, j);
            }
        }
        let complexity: number = 1;
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                if ( sudoku.cells[ i ][ j ].value == 0 || sudoku.cells[ i ][ j ].status != SudokuCellStatus.Set ) {
                    complexity *= sudoku.cells[ i ][ j ].possibleValues.length;
                }
            }
        }
        sudoku.complexity = Math.round(Math.pow(complexity, 0.1));
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
                        result.push(new OnlyPossibleValueSolveActionModel(
                            new CellPositionModel(i, j),
                            cell.possibleValues[ 0 ],
                            [],
                            sudoku.serialize()
                        ));
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
                cellSetLoop:
                    for (let i: number = 0; i < sudoku.cellSets.length; i++) {
                        const cellSet: SudokuCellSetModel = sudoku.cellSets[ i ];
                        if ( cellSet.presentedValues.has(n) ) {
                            // number presented
                            continue;
                        }
                        const possiblePositions: number[] = [];
                        for (let j: number = 0; j < 9; j++) {
                            if ( cellSet.cells[ j ].value === 0 && cellSet.cells[ j ].possibleValues.indexOf(n) > -1 ) {
                                if ( possiblePositions.length === 1 ) {
                                    // already have possible solution + this, no need to check further
                                    continue cellSetLoop;
                                }
                                possiblePositions.push(j);
                            }
                        }
                        if ( possiblePositions.length === 1 ) {
                            const pos: { x: number, y: number } = cellSet.getCellCoordinates(possiblePositions[ 0 ]);
                            sudoku.writeCalculatedValue(pos.x, pos.y, n);
                            result.push(new OnlyPossiblePositionSolveActionModel(
                                cellSet.setType,
                                new CellPositionModel(pos.x, pos.y),
                                n,
                                [],
                                sudoku.serialize()
                            ));
                            atLeastOneFoundOnLastIteration = true;
                        } else {
                            throw new SudokuError(1, 'Sudoku doesn\'t have any solution');
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
                result: null,
                explanation: null
            };
            let testSudoku: Sudoku;
            for (let testValue of valuesToCheck) {
                testSudoku = sudoku.clone();
                testValue.result = testSudoku;
                testSudoku.writeCalculatedValue(i, j, testValue.value);
                try {
                    // TODO check maybe we can make a quick sort here and then explain it if has good result;
                    // for now "quick" solving is not much quicker than explain :)
                    testValue.explanation = testSudoku.explain();
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
                result.push(new RecursiveSolveActionModel(
                    new CellPositionModel(i, j),
                    anySolution.value,
                    sudoku.serialize()
                ));
                result.push.apply(result, anySolution.explanation);
                sudoku.copyFrom(anySolution.result);
            }
        }
        return result;
    }

}