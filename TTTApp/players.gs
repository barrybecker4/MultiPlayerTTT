/**
 * A global instance that holds all the localized messages for the application
 * that are read from a spreadsheet specified by the configuration.
 * The order in which the local columns appear in the spreadsheet determine the
 * order in which they will appear in the language droplist.
 */
function getPlayers() {
    return getPlayersList(getConfig().gamesSheet);
}

/**
 * Create the players list
 */
function getPlayersList(spreadSheetId) {
  const thePlayers = [];

  var sheet = SpreadsheetApp.openById(spreadSheetId).getActiveSheet();
  enterCurrentPlayer(sheet);

  const lastColumn = 2
  const cellData = sheet.getSheetValues(2, 1, sheet.getLastRow(), lastColumn);
  // Sheets.Spreadsheets.Values.get(spreadsheetId, range);

  for (var i = 0; i < cellData.length - 1; i++) {
      const row = cellData[i];
      thePlayers.push(row[1]);
  }

  return thePlayers;
}

/**
 * add the current user to the list of players
 */
function enterCurrentPlayer(sheet) {
    const user = getUserId();
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 2).setValue(user);
}
