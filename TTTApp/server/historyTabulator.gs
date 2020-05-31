// encapsulate access to the persistent "games" table that contains the current state of all games.
var historyTabulator = getHistoryTabulator();

function historyTest() {
    var players = {
        player1: "barrybecker4",
        player2: "barrygbecker2",
    };
    players.history = historyTabulator.getHistory(players);
    Logger.log(JSON.stringify(players.history));
}

function getHistoryTabulator() {

    function getHistory(players) {
        // do a query to get all rows where these 2 players have played together
        var rows = gamesTable.getGamesPlayedBy(players);
        return tabulateHistoryStats(rows, players);
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
            // not sure why this is not scoped in closure...
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

    return {
        getHistory: getHistory,
    };
}
