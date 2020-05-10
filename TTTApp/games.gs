
function getGamesSheet() {
  const id = getConfig().gamesSheet;
  return SpreadsheetApp.openById(id).getActiveSheet();
}

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
  const lastRowNum = data.length - 1;
  var lastRow = data[lastRowNum];

  const user = getUserId();

  if (isThisPlayerAlreadyWaiting(user, lastRow)) {
      Logger.log("Player " + user + " is already waiting for a game...");
  }
  else if (isAnotherPlayerWaiting(user, lastRow)) {
      playAsPlayer2(user, sheet);
  }
  else if (noPlayersWaiting(lastRow, lastRowNum)) {
      createNewGame(user, lastRowNum, sheet)
  }
  else throw new Error("Unexpected case");
}

function isThisPlayerAlreadyWaiting(user, lastRow) {
    Logger.log("p1 = " + lastRow[getPlayer1Col()] + " p2 = " + lastRow[getPlayer2Col()]);
    return lastRow[getPlayer1Col()] == user && lastRow[getPlayer2Col()] == '';
}

function isAnotherPlayerWaiting(user, lastRow) {
    const player1 = lastRow[getPlayer1Col()];
    return player1 != user && lastRow[getPlayer2Col()] == '';
}

function noPlayersWaiting(lastRow, lastRowNum) {
    const player1 = lastRow[getPlayer1Col()];
    const player2 = lastRow[getPlayer2Col()];
    Logger.log("lastRowNum = " + lastRowNum + " p1 = " + player1 + " p2 = " + player2);
    return firstRowAndEmpty(lastRow, lastRowNum) || (player1 != '' && player2 != '');
}

function firstRowAndEmpty(lastRow, lastRowNum) {
    return lastRowNum == 0 && lastRow[getPlayer1Col()] == '' && lastRow[getPlayer2Col()] == '';
}

function playAsPlayer2(user, sheet) {
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, getPlayer2Col()).setValue(user);
  sheet.getRange(lastRow, getStatusCol()).setValue("X_WON");  // for now just consider that p1 won
}

function createNewGame(user, lastRowNum, sheet) {
    const lastRow = sheet.getLastRow();
    const rowToSet = firstRowAndEmpty(lastRow, lastRowNum) ? lastRow : lastRow + 1;
    sheet.getRange(rowToSet, getPlayer1Col()).setValue(user);
}


function getPlayerIdCol() {
  return 1;
}
function getPlayer1Col() {
  return 2;
}
function getPlayer2Col() {
  return 3;
}
function getStatusCol() {
  return 4;
}
function getBoardCol() {
  return 5;
}
