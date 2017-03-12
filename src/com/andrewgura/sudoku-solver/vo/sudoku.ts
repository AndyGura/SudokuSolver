import {SudokuCell} from "./sudoku-cell";
import {SudokuCellStatus} from "../enums/sudoku-cell-status.enum";
import SudokuError from "../errors/sudoku-error";
export class Sudoku {

    private static readonly MIN_KNOWN_CELLS_COUNT: number = 15;

    private invalidateIsValidFlag: boolean = false;
    private _isValid: boolean = false;

    public cells: Array<Array<SudokuCell>>;
    public complexity: number;

    constructor(copySource?: Sudoku) {
        // initialize cells 2D array 9x9 with SudokuCell instances or cells from "copySource" sudoku instance;
        this.cells = [...Array.from(Array(9).keys()).map(i => [...Array.from(Array(9).keys()).map(j =>
            copySource ? copySource.cells[i][j].clone() : new SudokuCell()
        )])];
    }

    setValue(i: number, j: number, value: number): void {
        this.clear(false);
        this.cells[i][j] = new SudokuCell(value);
        this.invalidateIsValid();
    }

    public get isValid(): boolean {
        if (this.invalidateIsValidFlag) {
            let knownCellsCounter: number = 0;
            let wrongCellsCounter: number = 0;
            for (let i: number = 0; i < 9; i++) {
                for (let j: number = 0; j < 9; j++) {
                    if (!this.cells[i][j].isUndefined()) {
                        let value: number = this.cells[i][j].value;
                        for (let ii: number = i + 1; ii < 9; ii++) {
                            if (this.cells[ii][j].value === value) {
                                this.markAsWrongValues(i, j, ii, j);
                                wrongCellsCounter++;
                            }
                        }
                        for (let jj: number = j + 1; jj < 9; jj++) {
                            if (this.cells[i][jj].value === value) {
                                this.markAsWrongValues(i, j, i, jj);
                                wrongCellsCounter++;
                            }
                        }
                        for (let ii: number = (i - i % 3); ii < (i - i % 3 + 3); ii++) {
                            for (let jj: number = (j - j % 3); jj < (j - j % 3 + 3); jj++) {
                                if (i === ii && j === jj) {
                                    continue;
                                }
                                if (this.cells[ii][jj].value === value) {
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
        // first, lets calculate the matrix of possible values
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                this.calculateCellPossibleValues(i, j);
            }
        }
        let complexity: number = 1;
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                if (this.cells[i][j].value == 0 || this.cells[i][j].status != SudokuCellStatus.Set) {
                    complexity *= this.cells[i][j].possibleValues.length;
                }
            }
        }
        this.complexity = Math.round(Math.pow(complexity, 0.1));
        let atLeastOneEmpty: boolean = true;
        let atLeastOneFoundOnLastIteration: boolean = true;
        while (atLeastOneEmpty && atLeastOneFoundOnLastIteration) {
            atLeastOneEmpty = false;
            atLeastOneFoundOnLastIteration = false;
            // 1. find the only possible numbers in the cell
            for (let i: number = 0; i < 9; i++) {
                for (let j: number = 0; j < 9; j++) {
                    let cell: SudokuCell = this.cells[i][j];
                    if (cell.value > 0) {
                        continue;
                    }
                    if (cell.possibleValues.length === 1) {
                        this.writeCalculatedValue(i, j, cell.possibleValues[0]);
                        atLeastOneFoundOnLastIteration = true;
                    } else {
                        if (cell.possibleValues.length === 0) {
                            throw new SudokuError(1, 'Sudoku doesn\'t have any solution');
                        }
                        atLeastOneEmpty = true;
                    }
                }
            }
            // 2. search possible positions of number
            // TODO rewrite in modern collection way
            for (let n: number = 1; n < 10; n++) {
                // find the only possible position of a number (in a row)
                for (let i: number = 0; i < 9; i++) {
                    let isNumberPresented: boolean = false;
                    for (let j: number = 0; j < 9; j++) {
                        if (this.cells[i][j].value === n) {
                            isNumberPresented = true;
                            break;
                        }
                    }
                    if (!isNumberPresented) {
                        let possiblePositions: number[] = [];
                        for (let j: number = 0; j < 9; j++) {
                            if (this.cells[i][j].value === 0 && this.cells[i][j].possibleValues.indexOf(n) > -1) {
                                possiblePositions.push(j);
                            }
                        }
                        if (possiblePositions.length === 1) {
                            this.writeCalculatedValue(i, possiblePositions[0], n);
                            atLeastOneFoundOnLastIteration = true;
                        }
                    }
                }
                // find the only possible position of a number (in a column)
                // TODO condence code (copy/paste)
                for (let j: number = 0; j < 9; j++) {
                    let isNumberPresented: boolean = false;
                    for (let i: number = 0; i < 9; i++) {
                        if (this.cells[i][j].value === n) {
                            isNumberPresented = true;
                            break;
                        }
                    }
                    if (!isNumberPresented) {
                        let possiblePositions: number[] = [];
                        for (let i: number = 0; i < 9; i++) {
                            if (this.cells[i][j].value === 0 && this.cells[i][j].possibleValues.indexOf(n) > -1) {
                                possiblePositions.push(i);
                            }
                        }
                        if (possiblePositions.length === 0) {
                            throw new SudokuError(1, 'Sudoku doesn\'t have any solution');
                        }
                        if (possiblePositions.length === 1) {
                            this.writeCalculatedValue(possiblePositions[0], j, n);
                            atLeastOneFoundOnLastIteration = true;
                        }
                    }
                }
            }
        }
        if (!atLeastOneFoundOnLastIteration && atLeastOneEmpty) {
            // few possible solutions. Let's check them recursively
            let i: number = 0;
            let j: number = 0;
            outer:
                for (i = 0; i < 9; i++) {
                    for (j = 0; j < 9; j++) {
                        if (this.cells[i][j].value === 0) {
                            break outer;
                        }
                    }
                }
            let valuesToCheck: any[] = [];
            for (let k: number = 0; k < this.cells[i][j].possibleValues.length; k++) {
                valuesToCheck.push({value: this.cells[i][j].possibleValues[k], result: null});
            }
            let solutionsCounter: number = 0;
            let anySolution: any = {value: 0, result: null};
            let testSudoku: Sudoku;
            for (let testValue of valuesToCheck) {
                testSudoku = this.clone();
                testValue.result = testSudoku;
                testSudoku.writeCalculatedValue(i, j, testValue.value);
                try {
                    testSudoku.solve();
                    anySolution = testValue;
                    solutionsCounter++;
                } catch (err) {
                    // if recursive solver said that sudoku has more than one solution, it is true
                    if ((err as SudokuError).code === 2) {
                        throw err;
                    }
                }
                if (solutionsCounter > 1) {
                    throw new SudokuError(2, 'Sudoku has more than one solution');
                }
            }
            if (solutionsCounter === 0) {
                throw new SudokuError(1, 'Sudoku doesn\'t have any solution');
            } else {
                this.copyFrom(anySolution.result);
            }
        }
    }

    calculateCellPossibleValues(i: number, j: number): void {
        let cell: SudokuCell = this.cells[i][j];
        if (cell.value > 0) {
            cell.possibleValues = [cell.value];
            return;
        }
        cell.possibleValues = [...Array.from(Array(9).keys()).map(i => ++i)];
        for (let ii: number = 0; ii < 9; ii++) {
            if (this.cells[ii][j].value > 0 && cell.possibleValues.indexOf(this.cells[ii][j].value) > -1) {
                cell.possibleValues.splice(cell.possibleValues.indexOf(this.cells[ii][j].value), 1);
            }
        }
        for (let jj: number = 0; jj < 9; jj++) {
            if (this.cells[i][jj].value > 0 && cell.possibleValues.indexOf(this.cells[i][jj].value) > -1) {
                cell.possibleValues.splice(cell.possibleValues.indexOf(this.cells[i][jj].value), 1);
            }
        }
        for (let ii: number = (i - i % 3); ii < (i - i % 3 + 3); ii++) {
            for (let jj: number = (j - j % 3); jj < (j - j % 3 + 3); jj++) {
                if (this.cells[ii][jj].value > 0 && cell.possibleValues.indexOf(this.cells[ii][jj].value) > -1) {
                    cell.possibleValues.splice(cell.possibleValues.indexOf(this.cells[ii][jj].value), 1);
                }
            }
        }
    }

    writeCalculatedValue(i: number, j: number, value: number): void {
        let cell: SudokuCell = this.cells[i][j];
        cell.value = value;
        cell.status = SudokuCellStatus.Calculated;
        for (let k: number = 0; k < 9; k++) {
            if (k !== i) {
                this.calculateCellPossibleValues(k, j);
            }
            if (k !== j) {
                this.calculateCellPossibleValues(i, k);
            }
        }
        for (let ii: number = (i - i % 3); ii < (i - i % 3 + 3); ii++) {
            for (let jj: number = (j - j % 3); jj < (j - j % 3 + 3); jj++) {
                if (i === ii || j === jj) {
                    continue;
                }
                this.calculateCellPossibleValues(ii, jj);
            }
        }
    }

    private markAsWrongValues(i: number, j: number, ii: number, jj: number): void {
        this.cells[i][j].status = SudokuCellStatus.Error;
        this.cells[ii][jj].status = SudokuCellStatus.Error;
    }

    clear(clearSetCells: boolean = true): void {
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                if (clearSetCells || [SudokuCellStatus.Error, SudokuCellStatus.Set].indexOf(this.cells[i][j].status) === -1) {
                    this.cells[i][j] = new SudokuCell(0);
                } else if (this.cells[i][j].status === SudokuCellStatus.Error) {
                    this.cells[i][j].status = SudokuCellStatus.Set;
                }
            }
        }
        this.invalidateIsValid();
    }

    copyFrom(copySource: Sudoku): void {
        this.cells = [...Array.from(Array(9).keys()).map(i => [...Array.from(Array(9).keys()).map(j =>
            copySource.cells[i][j].clone()
        )])];
    }

    clone(): Sudoku {
        return new Sudoku(this);
    }

    deserialize(value: string): void {
        this.clear(true);
        for (let i: number = 0; i < 9; i++) {
            for (let j: number = 0; j < 9; j++) {
                let cellValue: number = Number.parseInt(value[i * 9 + j], 19);
                this.cells[i][j] = new SudokuCell(cellValue > 0 && cellValue < 10 ? cellValue : 0);
            }
        }
        this.invalidateIsValid();
    }

    serialize(): string {
        let result: string = '';
        if (this.isValid) {
            for (let i: number = 0; i < 9; i++) {
                for (let j: number = 0; j < 9; j++) {
                    let value: number = this.cells[i][j].value;
                    if (value === 0) {
                        return '';
                    }
                    if (this.cells[i][j].status == SudokuCellStatus.Calculated) {
                        value += 9;
                    }
                    result += value.toString(19);
                }
            }
        }
        return result;
    }

}
