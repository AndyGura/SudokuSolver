import { SudokuCell } from './sudoku-cell.model';
import { SudokuCellStatus } from '../enums/sudoku-cell-status.enum';
import QuickSolveService from '../services/quick-solve.service';
import ExplanationSolveService from '../services/explanation-solve.service';
import SolveActionModel from './explanation/solve-action.model';
import SudokuCellSetModel from './sudoku-cell-set.model';
import { CellSetTypeEnum } from '../enums/cell-set-type.enum';
import CellPositionModel from './cell-position.model';

export class Sudoku {

    private static readonly MIN_KNOWN_CELLS_COUNT: number = 15;

    private invalidateIsValidFlag: boolean = false;
    private _isValid: boolean = false;

    public isSolved: boolean = false;
    public cells: Array<Array<SudokuCell>>;
    public cellSets: Array<SudokuCellSetModel>;
    public complexity: number;

    constructor(copySource?: Sudoku) {
        // initialize cells 2D array 9x9 with SudokuCell instances or cells from "copySource" sudoku instance;
        this.cells = [ ...Array.from(Array(9)
            .keys())
                               .map(i => [ ...Array.from(Array(9)
                                   .keys())
                                                   .map(j =>
                                                       copySource ? copySource.cells[ i ][ j ].clone() : new SudokuCell()
                                                   )
                               ])
        ];
        // initialize cell sets
        this.cellSets = [];
        let cellSet: SudokuCellSetModel;
        for (let i = 0; i < 9; i++) {
            // i-row
            cellSet = new SudokuCellSetModel(CellSetTypeEnum.Row, i);
            cellSet.cells = this.cells[ i ].slice();
            this.cellSets.push(cellSet);
            // i-column
            cellSet = new SudokuCellSetModel(CellSetTypeEnum.Column, i);
            cellSet.cells = this.cells.map((row: SudokuCell[]): SudokuCell => {
                return row[ i ];
            });
            this.cellSets.push(cellSet);
            // i-cell
            cellSet = new SudokuCellSetModel(CellSetTypeEnum.Cell, i);
            for (let j = 0; j < 9; j++) {
                const pos: CellPositionModel = cellSet.getCellCoordinates(j);
                cellSet.cells.push(this.cells[ pos.x ][ pos.y ]);
            }
            this.cellSets.push(cellSet);
        }
    }

    setValue(i: number, j: number, value: number): void {
        this.clear(false);
        this.cells[ i ][ j ].value = value;
        this.invalidateIsValid();
        this.isSolved = false;
    }

    public get isValid(): boolean {
        if ( this.invalidateIsValidFlag ) {
            let knownCellsCounter: number = 0;
            let wrongCellsCounter: number = 0;
            for (let i: number = 0; i < 9; i++) {
                for (let j: number = 0; j < 9; j++) {
                    if ( !this.cells[ i ][ j ].isUndefined() ) {
                        let value: number = this.cells[ i ][ j ].value;
                        for (let ii: number = i + 1; ii < 9; ii++) {
                            if ( this.cells[ ii ][ j ].value === value ) {
                                this.markAsWrongValues(i, j, ii, j);
                                wrongCellsCounter++;
                            }
                        }
                        for (let jj: number = j + 1; jj < 9; jj++) {
                            if ( this.cells[ i ][ jj ].value === value ) {
                                this.markAsWrongValues(i, j, i, jj);
                                wrongCellsCounter++;
                            }
                        }
                        for (let ii: number = (i - i % 3); ii < (i - i % 3 + 3); ii++) {
                            for (let jj: number = (j - j % 3); jj < (j - j % 3 + 3); jj++) {
                                if ( i === ii && j === jj ) {
                                    continue;
                                }
                                if ( this.cells[ ii ][ jj ].value === value ) {
                                    this.markAsWrongValues(i, j, ii, jj);
                                    wrongCellsCounter++;
                                }
                            }
                        }
                        knownCellsCounter++;
                    }
                }
            }
            this._isValid = (wrongCellsCounter == 0) && (knownCellsCounter >= Sudoku.MIN_KNOWN_CELLS_COUNT);
            this.invalidateIsValidFlag = false;
        }
        return this._isValid;
    }

    private invalidateIsValid(): void {
        this.invalidateIsValidFlag = true;
    }

    solve(): void {
        if ( this.isSolved ) {
            return;
        }
        QuickSolveService.solve(this);
        this.isSolved = true;
    }

    explain(): SolveActionModel[] {
        if ( this.isSolved ) {
            this.clear(false);
        }
        const result: SolveActionModel[] = ExplanationSolveService.solve(this);
        this.isSolved = true;
        return result;
    }

    calculateCellPossibleValues(i: number, j: number): void {
        let cell: SudokuCell = this.cells[ i ][ j ];
        if ( cell.value > 0 ) {
            cell.possibleValues = [ cell.value ];
            return;
        }
        cell.possibleValues = [ ...Array.from(Array(9)
            .keys())
                                        .map(i => ++i)
        ];
        for (let ii: number = 0; ii < 9; ii++) {
            if ( this.cells[ ii ][ j ].value > 0 && cell.possibleValues.indexOf(this.cells[ ii ][ j ].value) > -1 ) {
                cell.possibleValues.splice(cell.possibleValues.indexOf(this.cells[ ii ][ j ].value), 1);
            }
        }
        for (let jj: number = 0; jj < 9; jj++) {
            if ( this.cells[ i ][ jj ].value > 0 && cell.possibleValues.indexOf(this.cells[ i ][ jj ].value) > -1 ) {
                cell.possibleValues.splice(cell.possibleValues.indexOf(this.cells[ i ][ jj ].value), 1);
            }
        }
        for (let ii: number = (i - i % 3); ii < (i - i % 3 + 3); ii++) {
            for (let jj: number = (j - j % 3); jj < (j - j % 3 + 3); jj++) {
                if ( this.cells[ ii ][ jj ].value > 0 && cell.possibleValues.indexOf(this.cells[ ii ][ jj ].value) > -1 ) {
                    cell.possibleValues.splice(cell.possibleValues.indexOf(this.cells[ ii ][ jj ].value), 1);
                }
            }
        }
    }

    writeCalculatedValue(i: number, j: number, value: number): void {
        let cell: SudokuCell = this.cells[ i ][ j ];
        cell.value = value;
        cell.status = SudokuCellStatus.Calculated;
        for (let k: number = 0; k < 9; k++) {
            if ( k !== i ) {
                this.calculateCellPossibleValues(k, j);
            }
            if ( k !== j ) {
                this.calculateCellPossibleValues(i, k);
            }
        }
        for (let ii: number = (i - i % 3); ii < (i - i % 3 + 3); ii++) {
            for (let jj: number = (j - j % 3); jj < (j - j % 3 + 3); jj++) {
                if ( i === ii || j === jj ) {
                    continue;
                }
                this.calculateCellPossibleValues(ii, jj);
            }
        }
    }

    private markAsWrongValues(i: number, j: number, ii: number, jj: number): void {
        this.cells[ i ][ j ].status = SudokuCellStatus.Error;
        this.cells[ ii ][ jj ].status = SudokuCellStatus.Error;
    }

    clear(clearSetCells: boolean = true): void {
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                if ( clearSetCells || [ SudokuCellStatus.Error, SudokuCellStatus.Set ].indexOf(this.cells[ i ][ j ].status) === -1 ) {
                    this.cells[ i ][ j ].value = 0;
                } else if ( this.cells[ i ][ j ].status === SudokuCellStatus.Error ) {
                    this.cells[ i ][ j ].status = SudokuCellStatus.Set;
                }
            }
        }
        this.invalidateIsValid();
        this.isSolved = false;
    }

    copyFrom(copySource: Sudoku): void {
        this.cells = [ ...Array.from(Array(9)
            .keys())
                               .map(i => [ ...Array.from(Array(9)
                                   .keys())
                                                   .map(j =>
                                                       copySource.cells[ i ][ j ].clone()
                                                   )
                               ])
        ];
    }

    clone(): Sudoku {
        return new Sudoku(this);
    }

    deserialize(value: string): void {
        this.clear(true);
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                let cellValue: number = Number.parseInt(value[ i * 9 + j ], 19);
                this.cells[ i ][ j ].value = cellValue > 0 && cellValue < 10 ? cellValue : 0;
            }
        }
        this.invalidateIsValid();
        this.isSolved = false;
    }

    serialize(): string {
        let result: string = '';
        if ( this.isValid ) {
            for (let i: number = 0; i < 9; i++) {
                for (let j: number = 0; j < 9; j++) {
                    let value: number = this.cells[ i ][ j ].value;
                    if ( value === 0 ) {
                        return '';
                    }
                    if ( this.cells[ i ][ j ].status == SudokuCellStatus.Calculated ) {
                        value += 9;
                    }
                    result += value.toString(19);
                }
            }
        }
        return result;
    }

    serializeSource(): string {
        let result: string = '';
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                if ( [ SudokuCellStatus.Error, SudokuCellStatus.Set ].indexOf(this.cells[ i ][ j ].status) === -1 ) {
                    result += '0';
                } else {
                    result += this.cells[ i ][ j ].value;
                }
            }
        }
        return result;
    }

}
