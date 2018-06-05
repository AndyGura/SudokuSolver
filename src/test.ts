import { Sudoku } from './com/andrewgura/sudoku-solver/models/sudoku.model';
import SolveActionModel from './com/andrewgura/sudoku-solver/models/explanation/solve-action.model';

function testSolver(): boolean {
    let testCases: string[] = [
        'ed367bahifagdi8cebh293ea6dgi72hafdc548eicgb613faebd79hai6gd582cbcd1hiegfgehb639ad',
        'dh15g6c9bfgcia2ehdeib48ca679cdfea7b8abhg3dfei7f5bihda334ia25hgfheg3fibdab1f8d79ce',
        '2hac5i6d7ge31df829dfi78beac3dbeah7i6f7hbicd5a1i5dfgch2ecgi24afh916hg52cd8b4f3aig5',
        'a7i4b36eh8fea79b4cdb3h5f9a738fbdeg9aeig618cbdb1dcigh659c2e8d1gfg5h96adc2fd17c2e8i',
        '1bcg4f9ehh9eb3a7647fdihea3b98fcgbdaee4b6a8c9gcagdeih26f7ahbced9258a9df7cdc9e6gbh1',
        'higb5a43ffd173ieh2cebfd87i1ba8cg5fd9i3f4h2a7e4ge1if3bh5b49achfg7hie642aca63h2gied',
        '8abgecfdiid36hbagef7ed9a2hca5dbc7hifcfih457babhg1fie3deb1igdc68dc85bfi1gg9fcah4eb'
    ];
    console.log('Checking solve result.................');
    for (let i: number = 0; i < testCases.length; i++) {
        let sudoku: Sudoku = new Sudoku();
        sudoku.deserialize(testCases[ i ]);
        try {
            sudoku.solve();
        } catch (err) {
            console.log('FAIL');
            return false;
        }
        if ( sudoku.serialize() != testCases[ i ] ) {
            console.log('WRONG RESULT');
            return false;
        }
    }
    console.log('OK');
    console.log('Checking explain result...............');
    for (let i: number = 0; i < testCases.length; i++) {
        let sudoku: Sudoku = new Sudoku();
        sudoku.deserialize(testCases[ i ]);
        try {
            const result: SolveActionModel[] = sudoku.explain();
            // console.log(testCases[ i ]);
            // console.log(`${result.join('\n')}\n\n`);
        } catch (err) {
            console.log('FAIL');
            return false;
        }
        if ( sudoku.serialize() != testCases[ i ] ) {
            console.log('WRONG RESULT');
            return false;
        }
    }
    console.log('OK');

    const theMostComplicatedSudoku: string = '8abgecfdiid36hbagef7ed9a2hca5dbc7hifcfih457babhg1fie3deb1igdc68dc85bfi1gg9fcah4eb';
    let sudokus: Sudoku[] = [];
    const passes: number = 100;

    let deserializeTime: number;
    let solveTime: number;
    let explainTime: number;
    let clearTime: number;

    console.log('Profiling.............................');

    console.log(`The most complicated sudoku profiling:`);


    let startTime: number = Date.now();
    let now: number;
    for (let i: number = 0; i < passes; i++) {
        let sudoku: Sudoku = new Sudoku();
        sudoku.deserialize(theMostComplicatedSudoku);
        sudokus.push(sudoku);
    }
    now = Date.now();
    deserializeTime = now - startTime;
    console.log(`\tdeserialize time: ${deserializeTime / passes} ms`);


    startTime = now;
    for (let i: number = 0; i < passes; i++) {
        sudokus[ i ].solve();
    }
    now = Date.now();
    solveTime = now - startTime;
    console.log(`\tsolve time: ${solveTime / passes} ms`);

    // starting from the scratch
    sudokus = [];
    for (let i: number = 0; i < passes; i++) {
        let sudoku: Sudoku = new Sudoku();
        sudoku.deserialize(theMostComplicatedSudoku);
        sudokus.push(sudoku);
    }

    startTime = now;
    for (let i: number = 0; i < passes; i++) {
        sudokus[ i ].explain();
    }
    now = Date.now();
    explainTime = now - startTime;
    console.log(`\texplain time: ${explainTime / passes} ms`);


    startTime = now;
    for (let i: number = 0; i < passes; i++) {
        sudokus[ i ].clear(false);
    }
    now = Date.now();
    clearTime = now - startTime;
    console.log(`\tclear time: ${clearTime / passes} ms`);


    console.log(`\tcomplexity: ${sudokus[ 0 ].complexity}`);
    return true;
}

let testResult: boolean = testSolver();
console.log(testResult ? 'Test success' : 'Test fail');