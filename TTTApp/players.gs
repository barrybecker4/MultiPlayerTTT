
function getGamesSheet() {
    return SpreadsheetApp.openById(getConfig().gamesSheet).getActiveSheet();
}

function getData(sheet) {
    return sheet.getSheetValues(2, 1, sheet.getLastRow(), getPlayerCol()); //sheet.getLastColumn());
}

function getPlayerCol() {
    return 2;
}

/**
 * Create the players list
 */
function getPlayers() {
  const thePlayers = [];

  var sheet = getGamesSheet();
  enterCurrentPlayer(sheet);


  const cellData = getData(sheet);
  // Sheets.Spreadsheets.Values.get(spreadsheetId, range);

  for (var i = 0; i < cellData.length - 1; i++) {
      const row = cellData[i];
      thePlayers.push(row[1]);
  }

  return thePlayers;
}

function removePlayer() {
   var sheet = getGamesSheet();
   removeCurrentPlayer(sheet);
}

/**
 * add the current user to the list of players
 */
function enterCurrentPlayer(sheet) {
    const user = getUserId();
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, getPlayerCol()).setValue(user);
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
