/** back-end handling of player board logic */

/**
 * Set the symbol in the sheet in database,
 * and set the lastPlayer to move value as well (from playersSymbol).
 * return { status, winningPositions, boardData, nextPlayer }
 */
function doPlayerMove(gameId, playersSymbol, cellPos) {
    var doc = gamesTable.getGameById(gameId);
    var game = doc.fields;
    const r = utils.rint(2, 100);

    var state = determineNewBoardState(playersSymbol, cellPos, game.board);

    game.status = state.status;
    game.lastPlayer = playersSymbol;
    game.board = state.boardData;

    // the game is now officially started
    gamesTable.updateGame(doc);
    return state;
}

/**
 * The player playerSymbol quits or times out. Update state in sheet.
 */
function doPlayerTerminates(gameId, playersSymbol, statusSuffix) {
    var doc = gamesTable.getGameById(gameId);
    var game = doc.fields;

    game.lastPlayer = playersSymbol;
    game.status = getOtherPlayer(playersSymbol) + statusSuffix;

    gamesTable.updateGame(doc);
}

/**
 * @return info about the game in the form { nextPlayer: X or O, board: String, status }
 */
function getCurrentGameBoard(gameId) {
    var doc = gamesTable.getGameById(gameId);
    var game = doc.fields;
    var nextPlayerToMove = game.lastPlayer == 'X' ? 'O' : 'X';

    return {
        gameId: gameId,
        nextPlayer: nextPlayerToMove,
        boardData: game.board,
        status: game.status,
    };
}

/** for testing only */
function unitTests() {
    var state = null;
    const r = utils.rint(2, 100)
    state = determineNewBoardState('X', 0, '_O_XXXO_O');
    //Logger.log(JSON.stringify(state));  // X_WIN
    state = determineNewBoardState('O', 1, 'X_OXOXOOO');
    //Logger.log(JSON.stringify(state));  // O_WIN
    state = determineNewBoardState('O', 2, 'XO_OXXOXO');
    //Logger.log(JSON.stringify(state));  // TIE
    state = determineNewBoardState('O', 2, 'X_O_X_O_O');
    //Logger.log(JSON.stringify(state));  // ACTIVE
    state = determineNewBoardState('O', 4, 'X_O_X_O_O');
    //Logger.log(JSON.stringify(state));  // ERROR
}

/**
 * @return current board state in an object that looks like this:
 *  { status: boardStatus, winningPositions: <[p1, p2, p4] | null if none> } // boardId, board, nextPlayer
 */
function determineNewBoardState(playersSymbol, cellPos, boardData) {

    if (boardData.charAt(cellPos) != '_') {
        // It's a bug if this happens
        throw new Error('SERVER ERROR: Cannot play in occupied position (' + boardData.charAt(cellPos) + ')!');
    }
    var board = boardData.substr(0, cellPos) + playersSymbol + boardData.substr(cellPos + 1);
    var winningPositions = checkRows(board) || checkColumns(board) || checkDiagonals(board);
    var isTie = !winningPositions && !hasEmptyPositions(board);
    var theStatus = isTie ? status.TIE : (winningPositions ? board[winningPositions[0]] + '_WIN' : status.ACTIVE);

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

function getOtherPlayer(symbol) {
    return symbol == 'X' ? 'O' : 'X';
}
