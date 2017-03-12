import {Sudoku} from "./com/andrewgura/sudoku-solver/vo/sudoku";
function testSolver(): boolean {
    let testCases: string[] = [
        "ed367bahifagdi8cebh293ea6dgi72hafdc548eicgb613faebd79hai6gd582cbcd1hiegfgehb639ad",
        "dh15g6c9bfgcia2ehdeib48ca679cdfea7b8abhg3dfei7f5bihda334ia25hgfheg3fibdab1f8d79ce",
        "2hac5i6d7ge31df829dfi78beac3dbeah7i6f7hbicd5a1i5dfgch2ecgi24afh916hg52cd8b4f3aig5",
        "a7i4b36eh8fea79b4cdb3h5f9a738fbdeg9aeig618cbdb1dcigh659c2e8d1gfg5h96adc2fd17c2e8i",
        "1bcg4f9ehh9eb3a7647fdihea3b98fcgbdaee4b6a8c9gcagdeih26f7ahbced9258a9df7cdc9e6gbh1",
        "higb5a43ffd173ieh2cebfd87i1ba8cg5fd9i3f4h2a7e4ge1if3bh5b49achfg7hie642aca63h2gied"
    ];
    for (let i: number = 0; i < testCases.length; i++) {
        let sudoku: Sudoku = new Sudoku();
        sudoku.deserialize(testCases[i]);
        try {
            sudoku.solve();
        } catch (err) {
            return false;
        }
        if (sudoku.serialize() != testCases[i]) {
            return false;
        }
    }
    return true;
}

let testResult: boolean = testSolver();
console.log(testResult ? 'Test success' : 'Test fail');