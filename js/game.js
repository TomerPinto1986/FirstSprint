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
var gIsRightClick = false;
var gHints;
var gHintLocation;
var gHelpLocation;


function init() {
    var elSafe = document.querySelector('.safe')
    elSafe.innerText = 'safe\n' + 3;
    gHints = resetHints();
    gIsRightClick = false;
    gIsFirstMove = true;
    gGame = resetGame();
    gLevel = resetLevel(gDifficulty);
    gBoard = createFirstBoard();
    renderBoard(gBoard);
    return;
}

function startGame(elBtn, i, j) {
    startTimer();
    gIsFirstMove = false;
    var StartIdx = i * gLevel.size + j;
    gMines = resetMines(gLevel.mineCount, gDifficulty, StartIdx);
    gBoard = buildBoard(gDifficulty, gMines);
    setMinesNegsCount(gBoard);
    if (!gIsRightClick) {
        cellClicked(elBtn, i, j);
    } else {
        gIsRightClick = false;
        cellRightClick(i, j);
    }

}

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
            res = (res === 0) ? '' : res;
            var cellShown = (board[i][j].isShown) ? 'shown' : '';
            var cellHinted = (board[i][j].isHinted) ? 'hint' : '';
            strHTML += `<td onmousedown="WhichButton(event)" class="cell cell ${i} - ${j} ${cellShown} ${cellHinted}">`
            strHTML += res;
            strHTML += '</td>';
        }
        strHTML += '</tr>';
    }
    var elTable = document.querySelector('.board');
    elTable.innerHTML = strHTML;
}

function WhichButton(ev) {


    // *************  NOT SO NICE WAY TO GET COORDS   **************

    var temp = ev.currentTarget.classList;
    var i = +temp[1];
    var j = +temp[3];
    if (!j && j !== 0) j = i;

    // ******************************************************

    if (gIsFirstMove) {
        gIsFirstMove = false;
        // console.log(ev.which);
        gIsRightClick = (ev.which === 3);
        startGame(ev.currentTarget, i, j);
        return;
    }
    if (!gGame.isOn) return;
    else if (ev.which === 1) {
        cellClicked(ev.currentTarget, i, j);
        return;
    } else if (ev.which === 3) {
        cellRightClick(i, j)
        return;
    }
    return;
}

function cellRightClick(i, j) {
    // console.log('right button');

    if (!gBoard[i][j].isMarked) {
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

    if (gGame.isGameHint) {
        handleClickHint(i, j);
        return;
    }
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked || !gGame.isOn) return;
    if (gBoard[i][j].isMine) {
        // console.log('BOMB');
        handleMineClicked(i, j);
    } else exposeArea(elBtn, i, j);
}

function exposeArea(elBtn, rowIdx, colIdx) {
    if (!gBoard[rowIdx][colIdx].isZeroNegs) {
        gBoard[rowIdx][colIdx].isShown = true;
        gGame.shownCount++;
    } else {
        gBoard[rowIdx][colIdx].isShown = true;
        gGame.shownCount++;
        gBoard[rowIdx][colIdx].isZeroNegs = false;
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i > gBoard.length - 1) continue;
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j > gBoard.length - 1) continue;
                if ((gBoard[i][j].isShown) || (gBoard[i][j].isMarked) || (i === rowIdx && j === colIdx)) continue;
                else {
                    exposeArea(elBtn, i, j);
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

function handleMineClicked(rowIdx, colIdx) {
    if (gGame.live === 0) gameOver();
    else {
        gBoard[rowIdx][colIdx].isShown = true;
        renderBoard(gBoard);
        gHelpLocation = {
            i: rowIdx,
            j: colIdx
        }
        setTimeout(function() {
            gBoard[gHelpLocation.i][gHelpLocation.j].isShown = false;
            renderBoard(gBoard);
        }, 700);
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
    storeData();
}

function storeData() {
    console.log('store data');
    switch (gDifficulty) {
        case 4:
            console.log('level easy');
            if (!localStorage.bestScoreEasy) localStorage.bestScoreEasy = gGame.secsPassed;
            if (localStorage.bestScoreEasy > gGame.secsPassed) {
                localStorage.bestScoreEasy = gGame.secsPassed;
                var userName = prompt('Well Done you have The best score, write your name for the leader bord:');
                localStorage.bestPlayerEasy = userName + ' ROCKs with time of:' + localStorage.bestScoreEasy + ' sec';
                console.log('level normal');
            }
            console.log('level easy');
            break;
        case 8:
            console.log('level normal');
            if (!localStorage.bestScoreNormal) localStorage.bestScoreNormal = gGame.secsPassed;
            if (localStorage.bestScoreNormal > gGame.secsPassed) {
                localStorage.bestScoreNormal = gGame.secsPassed;
                var userName = prompt('Well Done you have The best score, write your name for the leader bord:');
                localStorage.bestPlayerNormal = userName + ' ROCKs with time of:' + localStorage.bestScoreNormal + ' sec';
                console.log('level normal');
            }


            break;
        case 12:
            if (!localStorage.bestScoreExtream) localStorage.bestScoreExtream = gGame.secsPassed;
            if (localStorage.bestScoreExtream > gGame.secsPassed) {
                localStorage.bestScoreExtream = gGame.secsPassed;
                var userName = prompt('Well Done you have The best score, write your name for the leader bord:');
                localStorage.bestPlayerExtream = userName + ' ROCKs with time of:' + localStorage.bestScoreExtream + ' sec';
                console.log('level normal');
            }
            break;
    }
    changeDifficulty(gDifficulty);
}

function restartGame() {
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

function getHint(elBtn, hintIdx) {
    if (!gGame.isOn) return;
    if (!gGame.isGameHint) {
        elBtn.style.backgroundColor = "red";
        gGame.isGameHint = true;
        gHints[hintIdx].isOn = true;
    } else {
        if (gHints[hintIdx].isOn) {
            elBtn.style.backgroundColor = "rgb(93, 206, 187)";
            gGame.isGameHint = false;
            gHints[hintIdx].isOn = false;
        }
    }
    return;
}

function handleClickHint(rowIdx, colIdx) {

    gHintLocation = {
        i: rowIdx,
        j: colIdx
    };
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue;
            gBoard[i][j].isHinted = true;
        }
    }
    renderBoard(gBoard);
    setTimeout(closeHints, 2000);
    for (var i = 0; i < gHints.length; i++) {
        if (!gHints[i].isOn) continue;
        var elHints = document.querySelectorAll('.hints button');
        console.log(elHints);
        elHints[i].style.display = 'none';
    }
    gGame.isGameHint = false;
}

function closeHints() {
    var rowIdx = gHintLocation.i;
    var colIdx = gHintLocation.j;

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue;
            gBoard[i][j].isHinted = false;
        }
    }
    renderBoard(gBoard);
}

function showSafe() {
    if ((gGame.isHelp === true) || (gGame.safeCount === 0)) return;
    var safeCellCount = gDifficulty ** 2 - gGame.shownCount - gLevel.mineCount;
    var rndIdx = getRandomInt(0, safeCellCount);
    for (var i = 0; i < gDifficulty; i++) {
        console.log('show safe');
        for (var j = 0; j < gDifficulty; j++) {
            if (gBoard[i][j].isMine || gBoard[i][j].isShown) continue;
            if (rndIdx === 0) {
                gGame.safeCount--;
                var elSafe = document.querySelector('.safe')
                elSafe.innerText = 'safe\n' + gGame.safeCount;
                gGame.isHelp = true;
                gBoard[i][j].isShown = true;
                gHelpLocation = {
                    i,
                    j
                }
                renderBoard(gBoard);
                setTimeout(function() {
                    gBoard[gHelpLocation.i][gHelpLocation.j].isShown = false;
                    renderBoard(gBoard);
                    gGame.isHelp = false;
                }, 1500);
                return;
            } else rndIdx--;

        }
    }
}