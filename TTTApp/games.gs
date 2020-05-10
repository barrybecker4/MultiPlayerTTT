
var status = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    X_WIN: 'X_WIN',
    O_WIN: 'O_WIN',
    X_BY_RESIGN: 'X_BY_RESIGN',
    O_BY_RESIGN: 'O_BY_RESIGN',
}

function getGamesSheet() {
  const id = getConfig().gamesSheet;
  return SpreadsheetApp.openById(id).getActiveSheet();
}

/**
 * @return the data in the specified sheet, excluding the initial header row.
 * Rows will be indexed starting at 0. The last row has all blank values.
 */
function getData(sheet) {
  return sheet.getSheetValues(2, 1, sheet.getLastRow(), sheet.getLastColumn());
}

/**
 * When a new player enters, they will either be the first or second player.
 * These steps are performed:
 * - If last row contains this player as player1 and has no second player, then do nothing else.
 * - If last row contains player1 (not == this player) and has no second player, then add this player as second player,
 *   and set the status to active.
 * - If last row contains player1 and player2 already, then it is an active or finished game,
 *   so create a new row and add this player as player 1 and set the status to "pending".
 */
function newPlayerEnters() {
  var sheet = getGamesSheet();
  var data = getData(sheet);
  // last row always blanks, so take the one before
  var lastRowNum = data.length - 2;
  var lastRow = lastRowNum >= 0 ? data[lastRowNum] : null;

  var user = getUserId();
  var players = getPlayersFromRow(lastRow);
  var newPlayers;

  if (isThisPlayerAlreadyWaiting(user, players)) {
      Logger.log("Player " + user + " is already waiting for a game...");
      newPlayers = { player1: user };
  }
  else if (isAnotherPlayerWaiting(user, players)) {
      playAsPlayer2(user, sheet);
      newPlayers = { player1: players.player1, player2: user };
  }
  else if (noPlayersWaiting(players, lastRowNum)) {
      createNewGame(user, lastRowNum, sheet);
      newPlayers = { player1: user };
  }
  else throw new Error("Unexpected case");
  return newPlayers;
}

function checkForOpponent() {
    var sheet = getGamesSheet();
    var data = getData(sheet);
    // last row always blanks, so take the one before
    var lastRowNum = data.length - 2;
    var lastRow = data[lastRowNum];
    return getPlayersFromRow(lastRow);
}

function isThisPlayerAlreadyWaiting(user, players) {
    return players && players.player1 == user && !players.player2;
}

function isAnotherPlayerWaiting(user, players) {
    return players && players.player1 && players.player1 != user && !players.player2;
}

function noPlayersWaiting(players, lastRowNum) {
    var emptyTable = lastRowNum == -1 && !players;
    return emptyTable || players && (players.player1 && players.player2);
}

function getPlayersFromRow(row) {
    return row ? { player1: row[getPlayer1Col()], player2: row[getPlayer2Col()] } : null;
}

function playAsPlayer2(user, sheet) {
  var lastRow = sheet.getLastRow();
  var col = getPlayer2Col() + 1;

  // the game is now officially started
  sheet.getRange(lastRow, col, 1, 2)
      .setValues([[user, status.ACTIVE]]);
}

function createNewGame(user, lastRowNum, sheet) {
    var lastRow = sheet.getLastRow();
    var players = getPlayersFromRow(lastRow);
    sheet.getRange(lastRow + 1, getPlayer1Col() + 1, 1, 3)
        .setValues([[user, '', status.PENDING]]);
}

/**
 * Get all paired players. Just listing them from the table. This just for debugging
 */
function getPairedPlayers() {
    var pairedPlayersList = [];

    var sheet = getGamesSheet();
    var cellData = getData(sheet);
    // Sheets.Spreadsheets.Values.get(spreadsheetId, range);

    var row = null;
    for (var i = 0; i < cellData.length - 1; i++) {
        row = cellData[i];
        var pair = [row[getPlayer1Col()], row[getPlayer2Col()]];
        pairedPlayersList.push(pair);
    }

    return pairedPlayersList;
}

/**
 * If the player is alone at the table and leaves, then the row is removed.
 * If there is another player there, then this player loses the game.
 */
function playerLeaves() {
     var sheet = getGamesSheet();
     var data = getData(sheet);
     var lastRowNum = data.length - 2;
     var lastRow = data[lastRowNum];
     var user = getUserId();
     var players = getPlayersFromRow(lastRow);

     if (isThisPlayerAlreadyWaiting(user, players)) {
         sheet.deleteRow(lastRowNum + 2);
     }
}

function getPlayerIdCol() {
  return 0;
}
function getPlayer1Col() {
  return 1;
}
function getPlayer2Col() {
  return 2;
}
function getStatusCol() {
  return 3;
}
function getBoardCol() {
  return 4;
}