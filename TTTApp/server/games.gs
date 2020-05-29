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
    var openGames = gamesTable.getOpenGames();
    var user = getUserId();
    var players = getPlayersFromRow(openGames);
    var newPlayers;

    if (isThisPlayerAlreadyWaiting(user, players)) {
        // Logger.log("Player " + user + " is already waiting for a game...");
        newPlayers = { gameId: players.gameId, player1: user };
    }
    else if (isAnotherPlayerWaiting(user, players)) {
        playAsPlayer2(user, openGames);
        newPlayers = { gameId: players.gameId, player1: players.player1, player2: user };
    }
    else if (!players) {
        var newGameDoc = createNewGame(user);
        newPlayers = { gameId: gamesTable.getGameIdFromDoc(newGameDoc), player1: user };
    }
    else throw new Error("Unexpected case");
    return newPlayers;
}

function checkForOpponent(gameId) {
    var doc = gamesTable.getGameById(gameId);
    return getPlayersFromRow([doc]);
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
    var players = null;
    if (row && row.length == 1) {
        players = row[0].fields;
        players.gameId = gamesTable.getGameIdFromDoc(row[0]);
    }
    return players;
}

function playAsPlayer2(user, openGames) {
    var doc = openGames[0];
    var game = doc.fields;

    game.player2 = user;
    game.status = status.ACTIVE;
    game.lastPlayer = '';

    //var tempId = game.gameId;
    //delete game.gameId;

    // the game is now officially started
    gamesTable.updateDoc(doc);

    //game.gameId = tempId;
}

/**
 * return new game doc. The gameId is "name" and the game info is "fields"
 */
function createNewGame(user) {
    const newGame = {
        player1: user,
        player2: '',
        lastPlayer: '',
        status: status.PENDING,
        board: '_________'
    };

    // creates new row (doc) with generated random ID.
    return gamesTable.createGame(newGame);
}

/**
 * If the player is alone at the table and leaves, then the row (document) is removed.
 * If there is another player there, then this player loses the game.
 * get the doc for gameId. If there is another player then this player loses, else delete that doc.
 */
function playerLeaves(gameId) {
    var user = getUserId();

    var doc = gamesTable.getGameById(gameId);
    var players = getPlayersFromRow([doc]);

    if (isThisPlayerAlreadyWaiting(user, players)) {
        gamesTable.deleteGame(gameId);
    } else {
        var game = doc.fields;
        game.status = game.player1 == user ? status.O_BY_RESIGN : status.X_BY_RESIGN;
        gamesTable.updateGame(doc);
    }
}
