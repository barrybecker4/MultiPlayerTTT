// encapsulate access to the persistent "games" table that contains the current state of all games.

var gamesTable = getGamesTableAccessor();

function getGamesTableAccessor() {
    var firestore = getFirestore();
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

    return Object.freeze({
        createGame: createGame,
        updateGame: updateGame,
        deleteGame: deleteGame,
        getGameById: getGameById,
        getOpenGames: getOpenGames,
        getGameIdFromDoc: getGameIdFromDoc,
    });

}