/** back-end handling of player board logic */


/**
 * Set the symbol in the sheet in the board data column,
 * and set the lastPlayer to move value as well (from playersSymbol).
 * return {  status, winningPositions, boardData, nextPlayer }
 */
function doPlayerMove(gameId, playersSymbol, cellPos) {
    var sheet = getGamesSheet();

    var gameRange = sheet.getRange(gameId, getLastPlayerCol() + 1, 1, 3);
    var gameData = gameRange.getValues()[0];
    var boardData = gameData[2];

    var state = determineNewBoardState(playersSymbol, cellPos, boardData);

    gameRange.setValues([[playersSymbol, state.status, state.boardData]]);
    return state;
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
       boardData: boardData,
       status: gameStatus,
   };
}

/** for testing only */
function unitTests() {
    var state = null;
    state = determineBoardState('X', 0, '_O_XXXO_O');
    Logger.log(JSON.stringify(state));  // X_WON
    state = determineBoardState('O', 1, 'X_OXOXOOO');
    Logger.log(JSON.stringify(state));  // O_WON
    state = determineBoardState('O', 2, 'XO_OXXOXO');
    Logger.log(JSON.stringify(state));  // TIE
    state = determineBoardState('O', 2, 'X_O_X_O_O');
    Logger.log(JSON.stringify(state));  // ACTIVE
    state = determineBoardState('O', 4, 'X_O_X_O_O');
    Logger.log(JSON.stringify(state));  // ERROR
}

/**
 * @return current board state in an object that looks like this:
 *  { status: boardStatus, winningPositions: <[p1, p2, p4] | null if none> } // boardId, board, nextPlayer
 */
function determineNewBoardState(playersSymbol, cellPos, boardData) {
    if (boardData.charAt(cellPos) != '_') {
        // It's a bug if this happens
        throw new Error('SERVER ERROR: Cannot play in occupied position!');
    }
    var board = boardData.substr(0, cellPos) + playersSymbol + boardData.substr(cellPos + 1);
    var winningPositions = checkRows(board) || checkColumns(board) || checkDiagonals(board);
    var isTie = !winningPositions && !hasEmptyPositions(board);
    var theStatus = isTie ? status.TIE : (winningPositions ? board[winningPositions[0]] + '_WON' : status.ACTIVE);

    return {
        status: theStatus,
        winningPositions: winningPositions,
        boardData: board,
        nextPlayer: playersSymbol == 'X' ? 'O' : 'X'
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
    return checkTriple([0, 4, 8], boardData) || checkTriple([2, 4, 6], boardData);
}

function checkTriple(triple, board) {
    var first = board.charAt(triple[0]);
    return (first != '_' && first == board[triple[1]] && first == board[triple[2]]) ? triple : null;
}
