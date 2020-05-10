
function getPlayersSheet() {
  return SpreadsheetApp.openById(getConfig().playersSheet).getActiveSheet();
}

function getPlayerCol() {
  return 2;
}

/**
 * Add the current user to the list of players
 */
function enterCurrentPlayer() {
  var sheet = getPlayersSheet();

  // first remove them just in case there are already there
  removeCurrentPlayer(sheet);

  const user = getUserId();
  addPlayer(user, sheet);
}

function addPlayer(user, sheet) {
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, getPlayerCol()).setValue(user);
}

/**
 * Create the players list
 */
function getPlayers() {
  const thePlayers = [];

  var sheet = getPlayersSheet();

  const cellData = getData(sheet);
  // Sheets.Spreadsheets.Values.get(spreadsheetId, range);

  var row = null;
  for (var i = 0; i < cellData.length - 1; i++) {
      row = cellData[i];
      thePlayers.push(row[1]);
  }

  return thePlayers;
}

function removePlayer() {
   var sheet = getPlayersSheet();
   removeCurrentPlayer(sheet);
}

/**
 * remove all the rows containing the current player
 */
function removeCurrentPlayer(sheet) {
  var user = getUserId();
  var cellData = getData(sheet);

  var row = null;
  for (var i = cellData.length - 2; i >= 0; i--) {
      row = cellData[i];
      Logger.log("user at row " + i + " is " + row[1]);
      if (row[1] === user) {
        sheet.deleteRow(i  + 2);
      }
  }
}
