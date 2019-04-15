import {SudokuCell} from './sudoku-cell.model';
import {CellSetTypeEnum} from '../enums/cell-set-type.enum';
import CellPositionModel from './cell-position.model';
import AppUtils from '../utils/app.utils';
import EntanglementModel from './entanglement.model';
import IntsHashSet from '../utils/ints-hash-set';

export default class SudokuCellSetModel {

    public setType: CellSetTypeEnum;
    public index: number;
    public cells: SudokuCell[] = [];

    public presentedValues: Set<number>;
    public missedValues: Set<number>;

    constructor(setType: CellSetTypeEnum, index: number) {
        this.setType = setType;
        this.index = index;
        this.presentedValues = new Set<number>();
        this.missedValues = new Set<number>();
        for (let i = 1; i <= 9; i++) {
            this.missedValues.add(i);
        }
    }

    public getCellCoordinates(cellLocalIndex: number): CellPositionModel {
        switch (this.setType) {
            case CellSetTypeEnum.Row:
                return new CellPositionModel(this.index, cellLocalIndex);
            case CellSetTypeEnum.Column:
                return new CellPositionModel(cellLocalIndex, this.index);
            case CellSetTypeEnum.Cell:
                const thisPos: {x: number, y: number} = AppUtils.fromCellNumeration(this.index);
                const cellPos: {x: number, y: number} = AppUtils.fromCellNumeration(cellLocalIndex);
                return {
                    x: thisPos.x * 3 + cellPos.x,
                    y: thisPos.y * 3 + cellPos.y
                };
        }
    }

    public onCellValueSet(cell: SudokuCell, value: number): void {
        this.presentedValues.add(value);
        this.missedValues.delete(value);
        for (let i = 0; i < this.cells.length; i++) {
            const anotherCell: SudokuCell = this.cells[i];
            if (anotherCell.value > 0 || cell === anotherCell) {
                continue;
            }
            anotherCell.possibleValuesHash.removeItem(value);
        }
    }

    public onCellValueUnset(cell: SudokuCell, oldValue: number): void {
        this.missedValues.add(oldValue);
        this.presentedValues.delete(oldValue);
        for (let i = 0; i < this.cells.length; i++) {
            const anotherCell: SudokuCell = this.cells[i];
            if (anotherCell.value > 0 || cell === anotherCell) {
                continue;
            }
            anotherCell.possibleValuesHash.addItem(oldValue);
        }
    }

    /**
     * Finds entanglements.
     * Entanglement is a set of n cells, which contain the same n values, but order is unknown
     *
     * the simplest example is pair: we know that x and y values are 100% in a and b cells, so:
     * 1) a and b have only [x, y] possible values;
     * 2) all remaining (in this set) cells can't contain x and y in possible values.
     *
     * It helps to solve medium/hard sudoku without recursion
     * */

    public findEntanglements(): EntanglementModel[] {
        const result: EntanglementModel[] = [];
        const unknownCells: SudokuCell[] = this.cells.filter(cell => cell.value === 0);
        if (unknownCells.length < 2) {
            return [];
        }
        // if n cells have n the same possible values
        unknownCells.sort((cell1, cell2) => cell1.possibleValuesHash.hash - cell2.possibleValuesHash.hash);
        outerLoop:
            for (let i = 0; i < unknownCells.length; i++) {
                const cellsToCheck: SudokuCell[] = [unknownCells[i]];
                const hash: number = unknownCells[i].possibleValuesHash.hash;
                const possibleValuesLength: number = unknownCells[i].possibleValuesHash.toArray().length;
                if (possibleValuesLength < 2) {
                    continue;
                }
                for (let j = 1; j < possibleValuesLength; j++) {
                    if (i + j >= unknownCells.length || unknownCells[i + j].possibleValuesHash.hash !== hash) {
                        continue outerLoop;
                    }
                    cellsToCheck.push(unknownCells[i + j]);
                }
                result.push(new EntanglementModel(this, cellsToCheck, unknownCells[i].possibleValuesHash.toArray()));
                unknownCells.splice(i, cellsToCheck.length);
                i -= 1;
            }
        // if all n values can be only in n cells
        let missedValues: {value: number, positionsHash: IntsHashSet}[] = Array.from(this.missedValues.values())
                                                                               .filter(value => !result.find(
                                                                                   entanglement => entanglement.values.includes(value)))
                                                                               .map((value: number) => {
                                                                                   const allowedPositions: number[] = [];
                                                                                   for (const cell of unknownCells) {
                                                                                       if (cell.possibleValuesHash.hasItem(value)) {
                                                                                           allowedPositions.push(this.cells.indexOf(cell));
                                                                                       }
                                                                                   }
                                                                                   const set: IntsHashSet = new IntsHashSet();
                                                                                   set.fromArray(allowedPositions);
                                                                                   return {
                                                                                       value,
                                                                                       positionsHash: set
                                                                                   };
                                                                               });
        missedValues = missedValues.filter(value => !value.positionsHash.isSingleElement());
        missedValues.sort((value1, value2) => value1.positionsHash.hash - value2.positionsHash.hash);
        outerLoop:
            for (let i = 0; i < missedValues.length; i++) {
                const value = missedValues[i];
                const valuesToCheck = [value.value];
                const possiblePositionsLength: number = value.positionsHash.toArray().length;
                for (let j = 1; j < possiblePositionsLength; j++) {
                    if (i + j >= missedValues.length || missedValues[i + j].positionsHash.hash !== value.positionsHash.hash) {
                        continue outerLoop;
                    }
                    valuesToCheck.push(missedValues[i + j].value);
                }
                result.push(new EntanglementModel(
                    this,
                    value.positionsHash.toArray()
                         .map(index => this.cells[index]),
                    valuesToCheck
                ));
            }
        return result;
    }
}
