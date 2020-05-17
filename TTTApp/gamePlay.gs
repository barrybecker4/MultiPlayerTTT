/** back-end handling of player board logic */


/**
 * Set the symbol in the sheet in the board data column,
 * and set the lastPlayer to move value as well (from playersSymbol).
 */
function doPlayerMove(gameId, playersSymbol, cellPos) {
    var sheet = getGamesSheet();

    var gameRange = sheet.getRange(gameId, getLastPlayerCol() + 1, 1, 3);
    var gameData = gameRange.getValues()[0];
    var boardData = gameData[2];

    var newBoardData = boardData.substr(0, cellPos) + playersSymbol + boardData.substr(cellPos + 1);
    var state = determineBoardState(boardData);

    gameRange.setValues([[playersSymbol, state.status, newBoardData]]);
}

/**
 * @return info about the game in the form { nextPlayer: X or O, board: String, status }
 */
function getCurrentGameBoard(gameId) {

   var sheet = getGamesSheet();
   var gameData = sheet.getSheetValues(gameId, 1, gameId + 2, sheet.getLastColumn())[0];

   // get lastPlayer from sheet
   var lastPlayerToMove = gameData[getLastPlayerCol()];

   // get the string representing the board from the sheet
   var boardData = gameData[getBoardCol()];
   var gameStatus = gameData[getStatusCol()];

   var nextPlayerToMove = lastPlayerToMove == 'X' ? 'O' : 'X';

   return {
       nextPlayer: nextPlayerToMove,
       board: boardData,
       status: gameStatus,
   };
}

/** for testing only */
function unitTests() {
    var state = null;
    state = determineBoardState('XO_XXXO_O');
    Logger.log(JSON.stringify(state));  // X_WON
    state = determineBoardState('XOOXOXOOO');
    Logger.log(JSON.stringify(state));  // O_WON
    state = determineBoardState('XOOOXXOXO');
    Logger.log(JSON.stringify(state));  // TIE
    state = determineBoardState('X_O_X_O_O');
    Logger.log(JSON.stringify(state));  // ACTIVE
}

/**
 * @return current board state in an object that looks like this:
 *  { status: boardStatus, winningPositions: <[p1, p2, p4] | null if none> }
 */
function determineBoardState(boardData) {
    var winningPositions = checkRows(boardData) || checkColumns(boardData) || checkDiagonals(boardData);
    var isTie = !winningPositions && !hasEmptyPositions(boardData);
    var theStatus = isTie ? status.TIE : (winningPositions ? boardData[winningPositions[0]] + '_WON' : status.ACTIVE);
    return {
        status: theStatus,
        winningPositions: winningPositions,
    };
}

function hasEmptyPositions(board) {
    return board.indexOf("_") >= 0;
}

function checkRows(boardData) {
    for (var i = 0; i < 3; i++) {
        var row = 3 * i;
        var triple = [row, row + 1, row + 2];
        if (checkTriple(triple, boardData)) {
            return triple;
        }
    }
    return null;
}

function checkColumns(boardData) {
    for (var i = 0; i < 3; i++) {
        var triple = [i, i + 3, i + 6];
        if (checkTriple(triple, boardData)) {
            return triple;
        }
    }
    return null;
}

function checkDiagonals(boardData) {
    return checkTriple([0, 4, 8], boardData) || checkTriple([2, 4, 5], boardData);
}

function checkTriple(triple, board) {
    var first = board.charAt(triple[0]);
    return (first != '_' && first == board[triple[1]] && first == board[triple[2]]) ? triple : null;
}
