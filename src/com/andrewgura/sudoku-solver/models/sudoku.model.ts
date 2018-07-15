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
    public complexity: number = NaN;

    constructor(copySource?: Sudoku) {
        this.initCells();
        if ( copySource ) {
            this.copyFrom(copySource);
        }
    }

    private initCells(): void {
        this.cells = [];
        while (this.cells.length < 9) {
            const row: SudokuCell[] = [];
            while (row.length < 9) {
                row.push(new SudokuCell());
            }
            this.cells.push(row);
        }
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
        this.cells.forEach((row: SudokuCell[]): void => {
            row.forEach((cell: SudokuCell): void => {
                cell.cellSets = [];
            });
        });
        this.cellSets.forEach((cellSet: SudokuCellSetModel): void => {
            cellSet.cells.forEach((cell: SudokuCell): void => {
                cell.cellSets.push(cellSet);
            });
        });
    }

    setValue(i: number, j: number, value: number): void {
        this.clear(false);
        this.cells[ i ][ j ].value = value;
        this.cells[ i ][ j ].status = this.cells[ i ][ j ].value > 0 ? SudokuCellStatus.Set : SudokuCellStatus.Undefined;
        this.invalidateIsValid();
        this.isSolved = false;
    }

    public get isValid(): boolean {
        if ( this.invalidateIsValidFlag ) {
            let atLeastOneErrorFound: boolean = false;
            for (let i: number = 0; i < this.cellSets.length; i++) {
                const cellSet: SudokuCellSetModel = this.cellSets[ i ];
                const sortedKnownCells: SudokuCell[] = cellSet.cells
                                                              .filter(cell => cell.value > 0)
                                                              .sort((cell1, cell2) => cell1.value - cell2.value);
                for (let j: number = 0; j < sortedKnownCells.length - 1; j++) {
                    if ( sortedKnownCells[ j ].value === sortedKnownCells[ j + 1 ].value ) {
                        this.markAsWrongValues(sortedKnownCells[ j ], sortedKnownCells[ j + 1 ]);
                        atLeastOneErrorFound = true;
                    }
                }
            }
            let knownCellsCounter: number = 0;
            outer:
                for (let i: number = 0; i < 9; i++) {
                    for (let j: number = 0; j < 9; j++) {
                        if ( this.cells[ i ][ j ].isSet() ) {
                            knownCellsCounter++;
                            if ( knownCellsCounter >= Sudoku.MIN_KNOWN_CELLS_COUNT ) {
                                break outer;
                            }
                        }
                    }
                }
            this._isValid = !atLeastOneErrorFound && (knownCellsCounter >= Sudoku.MIN_KNOWN_CELLS_COUNT);
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

    writeCalculatedValue(x: number, y: number, value: number): void {
        let cell: SudokuCell = this.cells[ x ][ y ];
        cell.value = value;
        cell.status = SudokuCellStatus.Calculated;
    }

    private markAsWrongValues(...cells: SudokuCell[]): void {
        for (let i = 0; i < cells.length; i++) {
            cells[ i ].status = SudokuCellStatus.Error;
        }
    }

    clear(clearSetCells: boolean = true): void {
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                const cell: SudokuCell = this.cells[ i ][ j ];
                if ( clearSetCells || (!cell.isSet() && !cell.isError()) ) {
                    cell.value = 0;
                    cell.status = SudokuCellStatus.Undefined;
                } else if ( cell.status === SudokuCellStatus.Error ) {
                    cell.status = SudokuCellStatus.Set;
                }
            }
        }
        this.invalidateIsValid();
        this.isSolved = false;
    }

    copyFrom(copySource: Sudoku): void {
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                this.cells[ i ][ j ].value = copySource.cells[ i ][ j ].value;
                this.cells[ i ][ j ].status = copySource.cells[ i ][ j ].status;
                this.cells[ i ][ j ].possibleValues = copySource.cells[ i ][ j ].possibleValues;
            }
        }
    }

    clone(): Sudoku {
        return new Sudoku(this);
    }

    deserialize(value: string): void {
        this.clear(true);
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                const cell: SudokuCell = this.cells[ i ][ j ];
                const cellValue: number = Number.parseInt(value[ i * 9 + j ], 19);
                if ( cellValue > 0 && cellValue < 10 ) {
                    cell.value = cellValue;
                    cell.status = SudokuCellStatus.Set;
                } else {
                    cell.value = 0;
                    cell.status = SudokuCellStatus.Undefined;
                }
            }
        }
        this.invalidateIsValid();
        this.isSolved = false;
    }

    serialize(): string {
        let result: string = '';
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                let value: number = this.cells[ i ][ j ].value;
                if ( this.cells[ i ][ j ].status == SudokuCellStatus.Calculated ) {
                    value += 9;
                }
                result += value.toString(19);
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
