
const slp = require("@slippi/slippi-js");

const { moveMappings } = require('./moves');

const getPlayerCode = (files) => {
    var sums = {}
    for (var i = 0; i < files.length; i++) {
        const game = new slp.SlippiGame(files[i]);
        const settings = game.getSettings();
        if (settings && settings.players) {
            for (const key in settings.players) {
                const playerCode = settings.players[key].connectCode;
                if (playerCode in sums) {
                    sums[playerCode] += 1;
                } else {
                    sums[playerCode] = 1;
                }
            }
        }
    }
    return Object.keys(sums).reduce((a, b) => sums[a] > sums[b] ? a : b);
}


const indexGame = (filepath, playerCode) => {
    const game = new slp.SlippiGame(filepath);
    const settings = game.getSettings();
    if (!settings || !settings.players || Object.keys(settings.players).length !== 2) {
        return null;
    }
    var playerIndex = 0;
    var opponentIndex = 1;
    if (settings.players[0].connectCode !== playerCode) {
        playerIndex = 1;
        opponentIndex = 0;
    }
    return { game, playerIndex, opponentIndex };
}


function splitBy(files, playerCode) {
    const filesByCharacter = {};
    for (var i = 0; i < files.length; i++) {

        const indexedGame = indexGame(files[i], playerCode);
        if (!indexedGame) {
            continue;
        }
        const settings = indexedGame.game.getSettings();
        // @ts-ignore
        const key = slp.characters.getCharacterName(settings.players[indexedGame.opponentIndex].characterId);
        filesByCharacter[key] ||= [];
        filesByCharacter[key].push(files[i])
    }

    // culls if less than 20 games
    for (var key in filesByCharacter) {
        if (filesByCharacter[key].length < 20) {
            delete filesByCharacter[key]
        }
    }
    return filesByCharacter;
}

function vectorizeStage(stageId) {
    const stageIndex = {
        2: 0,
        3: 1,
        8: 2,
        28: 3,
        31: 4,
        32: 5,
    };
    var vec = [0, 0, 0, 0, 0, 0];
    vec[stageIndex[stageId]] = 1;
    return vec;
}

function vectorizeMove(moveId) {
    var ids = Object.keys(moveMappings);
    console.log(moveId, ids)
    return ids.map(id => {
        if (moveId.toString() === id){
            return 1;
        }
        return 0;
    })
}

function analyzeFiles(files) {
    const playerCode = getPlayerCode(files);

    const groupedGames = splitBy(files, playerCode);

    for (char in groupedGames) {
        const fileList = groupedGames[char];
        for (var i = 0; i < fileList.length; i++) {
            const indexedGame = indexGame(files[i], playerCode);
            const settings = indexedGame.game.getSettings();
            const stats = indexedGame.game.getStats();
            const frames = indexedGame.game.getFrames();
            for (var j = 0; j < stats.conversions.length; j++) {
                const conversion = stats.conversions[j];
                if (!(conversion.playerIndex === indexedGame.opponentIndex && conversion.openingType === 'neutral-win') ){
                    continue;
                }
                const stageVec = vectorizeStage(settings.stageId);
                const resultsInDeath = conversion.didKill ? 1 : 0;
                const firstFrame = frames[conversion.startFrame];

                const heroState = firstFrame.players[indexedGame.playerIndex];
                const villainState = firstFrame.players[indexedGame.opponentIndex];

                const moveVec = vectorizeMove(conversion.moves[0].moveId);
                const conversionVector = [
                    stageVec, 
                    resultsInDeath, 
                    heroState.post.percent, 
                    villainState.post.percent, 
                    moveVec
                ].flat();
            }

        }
    }


    return {}
}

module.exports = {
    analyzeFiles
}