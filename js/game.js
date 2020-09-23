'use strict';
console.log('mine sweeper');

const BOMB = '&#128163';
const FLAG = 'X?';

var gBoard;
var gLevel;
var gGame;
var gDifficulty = 4;
var gMines;
var gIsFirstMove;




function init() {
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
        isMarked: false
    }
    return cell;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            board[i][j].mineNegsCount = countNegs(board, i, j);
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
            strHTML += `<td onclick="cellClicked(this, ${i}, ${j})" onmousedown="WhichButton(event)" class="cell cell ${i} - ${j} ">`
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
    if (ev.which === 1 || ev.which === 0 || !gGame.isOn) return;
    var temp = ev.currentTarget.classList;
    var i = +temp[1];
    var j = +temp[3];
    if (!j && j !== 0) {
        if (!gBoard[i][i].isMarked) {
            if (gGame.markedCount === gLevel.mineCount) return;
            gBoard[i][i].isMarked = !(gBoard[i][i].isMarked);
            gGame.markedCount++;
        } else {
            gBoard[i][i].isMarked = !(gBoard[i][i].isMarked);
            gGame.markedCount--;
        }
    } else if (!gBoard[i][j].isMarked) {
        if (gGame.markedCount === gLevel.mineCount) return;
        gBoard[i][j].isMarked = !(gBoard[i][j].isMarked);
        gGame.markedCount++;
    } else {
        gBoard[i][j].isMarked = !(gBoard[i][j].isMarked);
        gGame.markedCount--;
    }
    if (checkVictory()) handleVictory();
    renderBoard(gBoard);

    return;
}

function cellClicked(elBtn, i, j) {
    if (gIsFirstMove) startGame(elBtn, i, j);
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked || !gGame.isOn) return;
    if (gBoard[i][j].isMine) {
        console.log('BOMB');
        handleMineClicked(elBtn, i, j);
    } else exposeArea(elBtn, i, j);
}

function exposeArea(elBtn, rowIdx, colIdx) {
    if (gBoard[rowIdx][colIdx].mineNegsCount !== 0) {
        renderCell(elBtn, rowIdx, colIdx, gBoard[rowIdx][colIdx].mineNegsCount);
        gGame.shownCount++;
    } else {
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i > gBoard.length - 1) continue;
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j > gBoard.length - 1) continue;
                if (!(gBoard[i][j].isShown)) {
                    gBoard[i][j].isShown = true;
                    gGame.shownCount++;
                }
            }
        }
        renderBoard(gBoard);
    }

    console.log(gGame.shownCount);
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
    gGame.isOn = false;
    renderBoard(gBoard);
    console.log('game over');
    gGame.shownCount = 0;

}

function handleVictory() {
    console.log('victory');
    gGame.shownCount = 0;
    gGame.isOn = false;

}

function restartGame(elBtn) {
    var elLive = document.querySelector('.lives');
    elLive.innerText = '💜💜💜'
    init();
}