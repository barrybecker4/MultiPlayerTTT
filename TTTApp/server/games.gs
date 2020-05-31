// Allowed game status
var status = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    X_WIN: 'X_WIN',
    O_WIN: 'O_WIN',
    TIE: 'TIE',
    X_BY_RESIGN: 'X_BY_RESIGN',
    O_BY_RESIGN: 'O_BY_RESIGN',
    X_BY_TIMEOUT: 'X_BY_TIMEOUT',
    O_BY_TIMEOUT: 'O_BY_TIMEOUT',
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
        addHistory(newPlayers);
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
    var players = getPlayersFromRow([doc]);
    if (players && players.player2) {
       addHistory(players);
    }
    return players;
}

function historyTest() {
    var players = {
        player1: "barrybecker4",
        player2: "barrygbecker2",
    };
    addHistory(players);
    Logger.log(JSON.stringify(players));
}

/**
 * Add to players a history object that contains the statistics on previous games that these 2 players played.
 * If will be formatted something like this in the UI:
 * You have played *joeSchmoe* 20 times in the past.
 * As player *X*, you won 5  (1 by resignation, 2 by timeout), lost 5 (2 by resignation), and tied 5 games.
 * As player *O*, you won 1, lost 4 (1 by timeout), and tied 1 game.
 */
function addHistory(players) {
    // do a query to get all rows where these 2 players have played together
    var rows = gamesTable.getGamesPlayedBy(players);
    players.history = tabulateHistoryStats(rows, players);
}
function tabulateHistoryStats(rows, players) {
    var games = rows.map(function(row) {
        return row.fields;
    });
    return tabulateHistoryStatsFromGames(games, players);
}

/**
 * For all of the games that these 2 players played, accumulate the stats for them.
 */
function tabulateHistoryStatsFromGames(games, players) {
    // its an error if this stats.totalActive is something other than 1
    var stats = {
        totalEncounters: 0,
        totalActive: 0,
        player1AsX: {
            totalTies: 0,
            totalWins: 0,
            totalLosses: 0,
            wins: {
                byResignation: 0,
                byTimeout: 0,
            },
            losses: {
                byResignation: 0,
                byTimeout: 0,
            },
        },
        player2AsX: {
            totalTies: 0,
            totalWins: 0,
            totalLosses: 0,
            wins: {
                byResignation: 0,
                byTimeout: 0,
            },
            losses: {
                byResignation: 0,
                byTimeout: 0,
            },
        },
        // not sure why this is not scoped...
        players: players,
    };

    var historyStats = games.reduce(statsReducer, stats);
    delete historyStats.players;
    return historyStats;

    /** For one of the games, accumulate the stats for it */
    function statsReducer(stats, game) {
        if (game.status == status.ACTIVE) {
            stats.totalActive += 1;
        }
        else {
           stats.totalEncounters += 1;
           if (game.player1 == stats.players.player1) {
               accumulateStatsForPlayer(stats.player1AsX, game);
           }
           else if (game.player1 == stats.players.player2) {
               accumulateStatsForPlayer(stats.player2AsX, game);
           }
           else {
               throw new Error('Unexpected case: game.player1 = ' + game.player1 + ' ' + JSON.stringify(players));
           }
        }
        return stats;
    }

    function accumulateStatsForPlayer(playerAs, game) {
        switch (game.status) {
            case status.TIE:
                playerAs.totalTies +=1;
                break;
            case status.X_WIN:
                playerAs.totalWins += 1;
                break;
            case status.X_BY_RESIGN:
                playerAs.totalWins += 1;
                playerAs.wins.byResignation += 1;
                break;
            case status.X_BY_TIMEOUT:
                playerAs.totalWins += 1;
                playerAs.wins.byTimeout += 1;
                break;
            case status.O_WIN:
                playerAs.totalLosses += 1;
                break;
            case status.O_BY_RESIGN:
                playerAs.totalLosses += 1;
                playerAs.losses.byResignation += 1;
                break;
            case status.O_BY_TIMEOUT:
                playerAs.totalLosses += 1;
                playerAs.losses.byTimeout += 1;
                break;
            default: throw new Error('Unexpected status: ' + game.status);
        }
    }
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

    // no need to store the id, but still preserve it
    var tempId = game.gameId;
    delete game.gameId;

    // the game is now officially started
    gamesTable.updateGame(doc);

    game.gameId = tempId;
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
    }
    else {
        var game = doc.fields;
        game.status = game.player1 == user ? status.O_BY_RESIGN : status.X_BY_RESIGN;
        gamesTable.updateGame(doc);
    }
}
