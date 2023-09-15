const { SlippiGame } = require("@slippi/slippi-js");

function getPlayerCode(files) {
    var sums = {}
    for (var i = 0; i < files.length; i++) {
        const game = new SlippiGame(files[i]);
        const metadata = game.getMetadata();
        if (metadata && metadata.players) {
            for (const key in metadata.players) {
                const playerCode = metadata.players[key].names.code;
                if (playerCode in sums) {
                    sums[playerCode] += 1;
                } else {
                    sums[playerCode] = 1;
                }
            }
        }
        return Object.keys(sums).reduce((a, b) => sums[a] > sums[b] ? a : b);
    }
}


function indexGame(filepath, playerCode) {
    const game = new SlippiGame(filepath);
    const metadata = game.getMetadata();
    if (!metadata || !metadata.players || Object.keys(metadata.players).length !== 2) {
        return [];
    }
    var playerIndex = '0'
    var opponentIndex = '1'
    if (metadata.players['0'].names.code !== playerCode) {
        playerIndex = '1'
        opponentIndex = '0'
    }
    return [game, playerIndex, opponentIndex]
}


module.exports = {
    getPlayerCode,
    indexGame,
}