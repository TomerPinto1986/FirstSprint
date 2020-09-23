'use strict';

function resetGame() {
    var gameStat = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        live: 0
    }
    return gameStat;
}

function checkCellToDisplay(cell) {
    if (gGame.isOn) {
        if (!cell.isShown) {
            if (cell.isMarked) return FLAG;
            else return '';
        } else return cell.mineNegsCount;
    } else if (cell.isMine) return BOMB;
    else if (cell.isShown) return cell.mineNegsCount;
    else return '';

}

function resetLevel(size) {
    if (size === 4) {
        var mineNum = 2;
    } else if (size === 8) {
        var mineNum = 12;
    } else var mineNum = 30;

    var gameLevel = {
        size,
        mineCount: mineNum
    }
    return gameLevel;
}

function resetMines(mineCount, size, noBombIdx) {
    var cellsFree = [];
    var mines = [];
    for (var i = 0; i < size ** 2; i++) {
        cellsFree.push([i]);
    }
    mines.splice(noBombIdx, 1);

    for (var i = 0; i < mineCount; i++) {
        var res = getRandomInt(0, cellsFree.length)
        var colIdx = cellsFree[res] % size;
        var rowIdx = Math.floor(cellsFree[res] / size);
        mines.push({ i: rowIdx, j: colIdx });
        cellsFree.splice(res, 1);
    }
    return mines;
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function countNegs(mat, rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx ||
                (j < 0 || j > mat.length - 1)) continue;
            var cell = mat[i][j].isMine;
            if (cell) count++;
        }
    }
    return count;
}

function changeDifficulty(difficulty) {
    gDifficulty = difficulty;
    init();
}

function createFirstBoard() {
    var board = [];
    for (var i = 0; i < gDifficulty; i++) {
        board[i] = [];
        for (var j = 0; j < gDifficulty; j++) {
            board[i][j] = '';
        }
    }
    return board;
}