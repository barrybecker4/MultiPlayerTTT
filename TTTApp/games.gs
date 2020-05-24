/**
 * remove this shortly
 */
PropertiesService.getScriptProperties()
                 .setProperty("CONFIG_SHEET_ID", "");

// Allowed game status
var status = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    X_WIN: 'X_WIN',
    O_WIN: 'O_WIN',
    TIE: 'TIE',
    X_BY_RESIGN: 'X_BY_RESIGN',
    O_BY_RESIGN: 'O_BY_RESIGN',
};

/**
 * When a new player enters, they will either be the first or second player.
 * These steps are performed:
 * - If there exists a row (document) that contains this player as player1,
 *   and has no second player, then do nothing else (as they are already waiting).
 * - If there is a that row contains player1 (not == this player) and has no second player, then add this player as second player,
 *   and set the game status to "active". It has officially started.
 * - If are no rows with missing player2, then create a new row (document)
 *   and add this player as player 1 and set the status to "pending".
 */
function newPlayerEnters() {
    var firestore = getFirestore();

    var openGames = getOpenGames(firestore);
    var user = getUserId();
    var players = getPlayersFromRow(openGames);
    var newPlayers;

    if (isThisPlayerAlreadyWaiting(user, players)) {
        Logger.log("Player " + user + " is already waiting for a game...");
        newPlayers = { player1: user };
    }
    else if (isAnotherPlayerWaiting(user, players)) {
        playAsPlayer2(user, openGames, firestore);
        newPlayers = { gameId: players.gameId, player1: players.player1, player2: user };
    }
    else if (!players) {
        createNewGame(user, firestore);
        newPlayers = { player1: user };
    }
    else throw new Error("Unexpected case");
    return newPlayers;
}

function getOpenGames(firestore) {
    var openGames = firestore.query("/games").where("player2", "==", "").execute();
    if (openGames.length > 1) {
        throw new Error("Unexpected: more than one current open game found: " + JSON.stringify(openGames));
    }
    return openGames;
}

function isThisPlayerAlreadyWaiting(user, players) {
    return players && players.player1 == user && !players.player2;
}

function isAnotherPlayerWaiting(user, players) {
    return players && players.player1 && players.player1 != user && !players.player2;
}

function noPlayersWaiting(players, openGames) {
    return openGames.length == 0 || players && (players.player1 && players.player2);
}

function getPlayersFromRow(row) {
    return (row && row.length == 1) ? row[0].fields : null;
}

function playAsPlayer2(user, openGames, firestore) {
    var doc = openGames[0];
    var game = doc.fields;
    game.player2 = user;
    game.status = status.ACTIVE;
    game.lastPlayer = '';

    // the game is now officially started
    var path = getPathFromDoc(doc);
    firestore.updateDocument(path, game);
}

function getPathFromDoc(doc) {
    return doc.name.substr(doc.name.indexOf("games/"));
}

function createNewGame(user, firestore) {
    const newGame = {
        gameID: 42,
        player1: user,
        player2: '',
        lastPlayer: '',
        status: status.PENDING,
        board: '_________'
    };

    var createGame = firestore.createDocument("/games", newGame);
}

/**
 * If the player is alone at the table and leaves, then the row (document) is removed.
 * If there is another player there, then this player loses the game.
 * get the doc for gameID. If there is another player then this player loses, else delete that doc.
 */
function playerLeaves(gameID) {
     var firestore = getFirestore();
     var user = getUserId();

     if (isThisPlayerAlreadyWaiting(user, players)) {
         // firestore.deleteDocument(getPathFromDoc(openGames[0]));
         firestore.deleteDocument('games/' + gameID);
     }
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

function getGameData() {
    var sheet = getGamesSheet();
    return getData(sheet);
}

function getGameIdCol() {
  return 0;
}
function getPlayer1Col() {
  return 1;
}
function getPlayer2Col() {
  return 2;
}
function getLastPlayerCol() {
  return 3;
}
function getStatusCol() {
  return 4;
}
function getBoardCol() {
  return 5;
}
