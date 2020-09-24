'use strict';
console.log('mine sweeper');

const BOMB = '&#128163';
const FLAG = '&#127988';

var gBoard;
var gLevel;
var gGame;
var gDifficulty = 4;
var gMines;
var gIsFirstMove;
var gStartTime;
var gIntervalTimer;
var gIsFirstClick;



function init() {
    gIsFirstClick = true;
    gIsFirstMove = true;
    gGame = resetGame();
    gLevel = resetLevel(gDifficulty);
    gBoard = createFirstBoard();
    renderBoard(gBoard);
    return;
}

function startGame(elBtn, i, j) {

    gIsFirstMove = false;
    var StartIdx = i * gLevel.size + j;
    gMines = resetMines(gLevel.mineCount, gDifficulty, StartIdx);
    gBoard = buildBoard(gDifficulty, gMines);
    setMinesNegsCount(gBoard);
    cellClicked(elBtn, i, j);
}

function createCell() {
    var cell = {
        mineNegsCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isZeroNegs: true
    }
    return cell;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            {
                board[i][j].mineNegsCount = countNegs(board, i, j);
                board[i][j].isZeroNegs = board[i][j].mineNegsCount === 0;
            }
        }
    }
}

function buildBoard(length, mines) {
    var board = [];
    for (var i = 0; i < length; i++) {
        board.push([]);
        for (var j = 0; j < length; j++) {
            board[i][j] = createCell();
        }
    }

    // *************   PUT SOME MINES!!  ****************
    for (var i = 0; i < mines.length; i++) {
        board[mines[i].i][mines[i].j].isMine = true;
    }
    return board;
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < gDifficulty; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gDifficulty; j++) {
            var res = checkCellToDisplay(board[i][j]);
            strHTML += `<td onmousedown="WhichButton(event)" class="cell cell ${i} - ${j} ">`
                // onclick="cellClicked(this, ${i}, ${j})"
            strHTML += res;
            strHTML += '</td>';
        }
        strHTML += '</tr>';
    }
    var elTable = document.querySelector('.board');
    elTable.innerHTML = strHTML;
}

function renderCell(elBtn, i, j, value) {
    // Select the elCell and set the value
    elBtn.innerHTML = value;
    gBoard[i][j].isShown = true;
}

function WhichButton(ev) {
    if (gIsFirstClick) {
        gIsFirstClick = false;
        startTimer();
    }
    var temp = ev.currentTarget.classList;
    var i = +temp[1];
    var j = +temp[3];
    if (!j && j !== 0) j = i;
    if (ev.which === 0 || !gGame.isOn) return;
    else if (ev.which === 1) {
        cellClicked(ev.currentTarget, i, j);
        return;
    }

    console.log('right button');

    if (!gBoard[i][j].isMarked) {
        if (gGame.markedCount === gLevel.mineCount) return;
        gBoard[i][j].isMarked = !(gBoard[i][j].isMarked);
        gGame.markedCount++;
    } else {
        gBoard[i][j].isMarked = !(gBoard[i][j].isMarked);
        gGame.markedCount--;
    }

    // if (!j && j !== 0) {
    //     if (!gBoard[i][i].isMarked) {
    //         if (gGame.markedCount === gLevel.mineCount) return;
    //         gBoard[i][i].isMarked = !(gBoard[i][i].isMarked);
    //         gGame.markedCount++;
    //     } else {
    //         gBoard[i][i].isMarked = !(gBoard[i][i].isMarked);
    //         gGame.markedCount--;
    //     }
    // } else if (!gBoard[i][j].isMarked) {
    //     if (gGame.markedCount === gLevel.mineCount) return;
    //     gBoard[i][j].isMarked = !(gBoard[i][j].isMarked);
    //     gGame.markedCount++;
    // } else {
    //     gBoard[i][j].isMarked = !(gBoard[i][j].isMarked);
    //     gGame.markedCount--;
    // }
    if (checkVictory()) handleVictory();
    renderBoard(gBoard);

    return;
}

function cellClicked(elBtn, i, j) {
    if (gIsFirstMove) {
        startGame(elBtn, i, j);
        return;
    }
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked || !gGame.isOn) return;
    if (gBoard[i][j].isMine) {
        console.log('BOMB');
        handleMineClicked(elBtn, i, j);
    } else exposeArea(elBtn, i, j);
}

function exposeArea(elBtn, rowIdx, colIdx) {
    debugger;
    if (!gBoard[rowIdx][colIdx].isZeroNegs) {
        gBoard[rowIdx][colIdx].isShown = true;
        // renderCell(elBtn, rowIdx, colIdx, gBoard[rowIdx][colIdx].mineNegsCount);
        gGame.shownCount++;
    } else {
        gBoard[rowIdx][colIdx].isZeroNegs = false;
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i > gBoard.length - 1) continue;
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j > gBoard.length - 1) continue;
                if ((gBoard[i][j].isShown) || (gBoard[i][j].isMarked) || (i === rowIdx && j === colIdx)) continue;
                else {
                    exposeArea(elBtn, i, j);
                    // gBoard[i][j].isShown = true;
                    // gGame.shownCount++;
                }
            }
        }
    }
    renderBoard(gBoard);

    if (checkVictory()) handleVictory();
    return;
}

function checkVictory() {
    if (gGame.shownCount === gDifficulty ** 2 - gLevel.mineCount && gGame.markedCount === gLevel.mineCount) {
        return true;
    }
    return false;
}

function handleMineClicked() {
    if (gGame.live === 0) gameOver();
    else {
        var elLive = document.querySelector('.lives');
        var hearts = '';
        for (var i = 0; i < gGame.live - 1; i++) {
            hearts += '💜';
        }
        elLive.innerText = hearts;
        gGame.live--;
    }
    return;
}

function gameOver() {
    var elGameOver = document.querySelector('.game-over');
    elGameOver.style.display = 'block';
    var elRestart = document.querySelector('.restart');
    elRestart.innerText = '😖';
    gGame.isOn = false;
    clearInterval(gIntervalTimer);
    renderBoard(gBoard);
    console.log('game over');
    gGame.shownCount = 0;

}

function handleVictory() {
    var elvictory = document.querySelector('.victory');
    elvictory.style.display = 'block';
    var elRestart = document.querySelector('.restart');
    elRestart.innerText = '😝';
    console.log('victory');
    gGame.shownCount = 0;
    gGame.isOn = false;
    clearInterval(gIntervalTimer);

}

function restartGame(elBtn) {
    var elRestart = document.querySelector('.restart');
    elRestart.innerText = '😀';
    var elGameOver = document.querySelector('.game-over');
    elGameOver.style.display = 'none';
    var elvictory = document.querySelector('.victory');
    elvictory.style.display = 'none';
    var elLive = document.querySelector('.lives');
    elLive.innerText = '💜💜💜'
    clearInterval(gIntervalTimer);
    init();
}