/** back-end handling of player movement */


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
    gameRange.setValues([[playersSymbol, status.ACTIVE, newBoardData]]);
}


function getCurrentGameBoard(gameId) {

   var sheet = getGamesSheet();
   var gameData = sheet.getSheetValues(gameId, 1, gameId + 2, sheet.getLastColumn())[0];

   // get lastPlayer from sheet
   var lastPlayerToMove = gameData[getLastPlayerCol()];

   // get the string representing the board from the sheet
   var boardData = gameData[getBoardCol()];

   var nextPlayerToMove = lastPlayerToMove == 'X' ? 'O' : 'X';

   return {
       nextPlayer: nextPlayerToMove,
       board: boardData,
   };
}
