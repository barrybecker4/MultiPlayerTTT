// encapsulate access to the persistent "games" table that contains the current state of all games.
var gamesTable = getGamesTableAccessor();

function getGamesTableAccessor() {
    var firestore = getFirestore().getInstance();
    const GAMES_TABLE = "games";

    function getOpenGames() {
        var openGames = firestore.query('/' + GAMES_TABLE).where("player2", "==", "").execute();
        if (openGames.length > 1) {
            throw new Error("Unexpected: more than one current open game found: " + JSON.stringify(openGames));
        }
        return openGames;
    }

    function getGameById(gameId) {
        return firestore.getDocument(GAMES_TABLE + '/' + gameId);
    }

    /**
     * @param newGame the json for the new game
     * @return the new game doc (which contains name and fields proeprties).
     */
    function createGame(newGame) {
        return firestore.createDocument('/' + GAMES_TABLE, newGame);
    }

    /**
     * @doc - the doc to update. Has name and fields properties. The fields prop is the json for the game.
     */
    function updateGame(doc) {
        firestore.updateDocument(getPathFromDoc(doc), doc.fields);
    }

    /**
     * @param gameId id of the game to delete
     */
    function deleteGame(gameId) {
        firestore.deleteDocument(GAMES_TABLE + '/' + gameId);
    }

    function getPathFromDoc(doc) {
        return doc.name.substr(doc.name.indexOf(GAMES_TABLE + '/'));
    }

    function getGameIdFromDoc(doc) {
        return getPathFromDoc(doc).substr(GAMES_TABLE.length + 1);
    }

    function getGamesPlayedBy(players) {
        var query = firestore.query('/' + GAMES_TABLE);

        var p1 = players.player1;
        var p2 = players.player2;

        var history1 = query.where('player1', '==', p1).where('player2', '==', p2).execute();
        var history2 = query.where('player1', '==', p2).where('player2', '==', p1).execute();

        return history1.concat(history2);
    }

    return {
        createGame: createGame,
        updateGame: updateGame,
        deleteGame: deleteGame,
        getGameById: getGameById,
        getOpenGames: getOpenGames,
        getGameIdFromDoc: getGameIdFromDoc,
        getGamesPlayedBy: getGamesPlayedBy,
    };

}