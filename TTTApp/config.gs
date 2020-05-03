/**
 * Some global configuration properties for the TTT application.
 * The parameter is the id to the spreadsheet containing the properties.
 * To protect the information in the configuration file, set the CONFIG_SHEET_ID once, remove it,
 * and then only access it as a script property. ScriptProperties are scoped per script
 * regardless of the user running it.
 * For security reasons, do not check in the id of your configuration spreadsheet into revision control.
 * Do not access this variable directly. Instead use getConfig().
 */
//PropertiesService.getScriptProperties()
//                 .setProperty("CONFIG_SHEET_ID", "1h25o3HBjIeEAkeMdysz2Qd5V2xIbIsXmZioos8XM4ps"); //<your config spreadsheet id here>);
var config;

/**
 * @return the configuration object. Created on first call using lazy initialization.
 */
function getConfig() {
  if (!config) {
    const properties = PropertiesService.getScriptProperties();
    config = createConfig(properties.getProperty("CONFIG_SHEET_ID"));
  }
  return config;
}

/**
 * Create the configuration object.
 * The spreadsheet that is read must contain property keys in the first column and values
 * for those properties in the second.
 * The following properties must be specified:
 *   - gamesSheet
 *   - loggingSheet
 *   - adminEmails
 *   - maxTimePerMove
 *
 * @param configSpreadSheetId id of the spread sheet to read property values from.
 * @returns configuration property map
 */
function createConfig(configSpreadSheetId) {
  var cfg = {};

  Logger.log("config sheet ID = " + configSpreadSheetId);

  const sheet = SpreadsheetApp.openById(configSpreadSheetId).getActiveSheet();

  const cellData = sheet.getSheetValues(2, 1, sheet.getLastRow(), 2);

  for (var i=0; i < cellData.length; i++) {
    const row = cellData[i];
    Logger.log("key=" + row[0] + " value="+ row[1]);
    // row[0] is the KEY and row[1] is the value
    cfg[row[0]] = row[1];
  }

  return cfg;
}
