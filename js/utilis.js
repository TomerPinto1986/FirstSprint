'use strict';


function createCell() {
    var cell = {
        mineNegsCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isZeroNegs: true,
        isHinted: false
    }
    return cell;
}


function resetGame() {
    var gameStat = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        live: 3,
        isGameHint: false,
        safeCount: 3,
        isHelp: false,
        isManualMine: false,
        manualCount: 2
    }
    if (gIsMamualMode) {
        gameStat.isManualMine = true;
        gameStat.manualCount = gLevel.mineCount;
    }

    return gameStat;
}

function checkCellToDisplay(cell) {
    if (gGame.isOn) {
        if (cell.isHinted) {
            if (cell.isMine) return BOMB;
            return cell.mineNegsCount;
        }
        if (!cell.isShown) {
            if (cell.isMarked) return FLAG;
            else return '';
        } else if (cell.isMine === true) {
            return BOMB
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
    cellsFree.splice(noBombIdx, 1);

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
    switch (gDifficulty) {
        case 4:
            gGame.manualCount = 2;
            break;
        case 8:
            gGame.manualCount = 12;
            break;
        case 12:
            gGame.manualCount = 30;
            break;
    }
    gDifficulty = difficulty;
    restartGame();
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

function startTimer() {
    gStartTime = Date.now();
    gIntervalTimer = setInterval(runTimer, 10);
}

function runTimer() {
    var elModal = document.querySelector('.timer');
    gGame.secsPassed = ((Date.now() - gStartTime)) / 1000;
    elModal.innerText = gGame.secsPassed;
    return;
}

function resetHints() {
    var hints = [];
    for (var i = 0; i < 3; i++) {
        hints[i] = {
            id: i,
            isOn: false
        }
    }
    var elHints = document.querySelectorAll('.hints button');
    for (var i = 0; i < hints.length; i++) {
        elHints[i].style.display = 'inline';
        elHints[i].style.backgroundColor = ' rgb(93, 206, 187)';
    }
    return hints;
}

function checkMineCoords(i, j) {
    for (var idx = 0; idx < gMines.length; idx++) {
        console.log(gMines[idx].i, ' mines i ', gMines[idx].j, ' mines j');
        if ((gMines[idx].i === i) && (gMines[idx].j === j)) return false;
    }
    return true;
}

function updateBestScore() {
    switch (gDifficulty) {
        case 4:
            console.log('Easy');
            var elBestScore = document.querySelector('.score');
            elBestScore.innerText = localStorage.bestPlayerEasy;
            break;
        case 8:
            console.log('Normal');
            var elBestScore = document.querySelector('.score');
            console.log(elBestScore, localStorage.bestPlayerNormal);
            elBestScore.innerText = localStorage.bestPlayerNormal;
            console.log(elBestScore.innerText);
            break;
        case 12:
            console.log('extream');
            var elBestScore = document.querySelector('.score');
            elBestScore.innerText = localStorage.bestPlayerExtream;
            break;
    }
}

function createBoardDeepCopy(board) {
    var boardDeepCopy = createFirstBoard();
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            var cellCopy = {
                mineNegsCount: cell.mineNegsCount,
                isShown: cell.isShown,
                isMine: cell.isMine,
                isMarked: cell.isMarked,
                isZeroNegs: cell.isZeroNegs,
                isHinted: cell.isHinted
            }
            boardDeepCopy[i][j] = cellCopy;
        }
    }
    return boardDeepCopy;
}