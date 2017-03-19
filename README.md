# SudokuSolver
Typescript module for solving sudoku puzzles

## Live demo
<a href="http://andrew-gura.pp.ua/sudoku-solver" target="_blank">andrew-gura.pp.ua/sudoku-solver</a>

## Installation
```bash
npm install https://github.com/AndyGura/SudokuSolver.git --save
```

## Use

Then you can use it as follows:

```javascript
import {Sudoku} from "sudoku-solver";

let sudoku: Sudoku = new Sudoku();
sudoku.setValue(0, 0, 5); // place number 5 into left-top corner;
//....
sudoku.solve();

//or
sudoku.deserialize("001506090000002000000480067900000708000030000705000003340025000000300000010807900");
sudoku.solve();
```