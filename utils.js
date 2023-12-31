
const _ = require('lodash');
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
        const oppoID = settings.players[indexedGame.opponentIndex].characterId;
        // const PID = settings.players[indexedGame.playerIndex].characterId;
        filesByCharacter[oppoID] ||= [];
        filesByCharacter[oppoID].push(files[i])
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
    return ids.map(id => {
        if (moveId.toString() === id) {
            return 1;
        }
        return 0;
    })
}

function vectorizePlayers(indexedGame, conversion, frames, numFrames = 5) {
    const frameAnalysisEnd = conversion.moves[0].frame;
    const moveLanded = frames[frameAnalysisEnd];
    const heroMLS = moveLanded.players[indexedGame.playerIndex];
    const endXH = heroMLS.post.positionX;
    const endYH = heroMLS.post.positionY;
    const villainMLS = moveLanded.players[indexedGame.opponentIndex];
    const endXV = villainMLS.post.positionX;
    const endYV = villainMLS.post.positionY;

    var result = [
        Math.trunc(heroMLS.pre.percent),
        Math.trunc(villainMLS.pre.percent),
    ];

    for (var i = 0; i < numFrames; i++) {
        const frameIndex = frameAnalysisEnd - (4 * i);
        const preFrame = frames[frameIndex]
        const hero = preFrame.players[indexedGame.playerIndex];
        const villain = preFrame.players[indexedGame.opponentIndex];
        result.push([
            endXH - hero.post.positionX,
            endYH - hero.post.positionY,
            endXV - villain.post.positionX,
            endYV - villain.post.positionY,
        ])
    }

    return result.flat();
}

function vectorizePlayerStateV2(playerIndex, frames, frameIndex) {
    const hero = frames[frameIndex].players[playerIndex];
    var data = _.pick(hero,
        [
            'positionX',
            'positionY',
            'facingDirection',
            'percent',
            'shieldSize',
            'isAirborne' ? 1 : 0,
            'jumpsRemaining',
            'lCancelStatus',
        ]
    );
    var speeds = _.pick(hero.selfInducedSpeeds, [
        'airX',
        'y',
        'attackX',
        'attackY',
        'groundX',
    ]);
    return [data, speeds].flat();
}

function vectorizePlayersV2(indexedGame, frames, frameIndex, numFrames = 5) {
    const analyzedFrame = frames[frameIndex];
    const heroState = analyzedFrame.players[indexedGame.playerIndex];
    const endXH = heroState.post.positionX;
    const endYH = heroState.post.positionY;
    const villainState = analyzedFrame.players[indexedGame.opponentIndex];
    const endXV = villainState.post.positionX;
    const endYV = villainState.post.positionY;

    var result = [
        Math.trunc(heroState.pre.percent),
        Math.trunc(villainState.pre.percent),
    ];

    for (var i = 0; i < numFrames; i++) {
        const preFrame = frames[frameIndex]
        const hero = preFrame.players[indexedGame.playerIndex];
        const villain = preFrame.players[indexedGame.opponentIndex];
        result.push([
            endXH - hero.post.positionX,
            endYH - hero.post.positionY,
            endXV - villain.post.positionX,
            endYV - villain.post.positionY,
        ])
    }

    return result.flat();
}


function randomList(n, range) {
    var arr = [];
    while (arr.length < n) {
        var r = _.random(range)
        if (arr.indexOf(r) === -1) arr.push(r);
    }
    return arr;
}



// vectorizeFilesV3: let's get all the data on our own combos
function vectorizeFilesV3(files) {
    let fullData = {};
    const playerCode = getPlayerCode(files);

    const groupedGames = splitBy(files, playerCode);
    for (char in groupedGames) {
        const oppo = slp.characters.getCharacterName(char)
        if ('Captain Falcon' !== slp.characters.getCharacterName(char)) continue;
        const fileList = groupedGames[char];
        console.log(char, 'start', fileList.length)
        fullData[oppo] = []
        for (var i = 0; i < fileList.length; i++) {
            if (i % 25 === 0 && i > 0) console.log(char, 'pct complete:', i / fileList.length);
            const indexedGame = indexGame(fileList[i], playerCode);
            const stats = indexedGame.game.getStats();
            const convs = stats.conversions.filter(c =>
                c.playerIndex == indexedGame.opponentIndex &&
                c.didKill || c.endPercent - c.startPercent > 20
            );
            _.forEach(convs, c => {
                fullData[oppo].push([
                    char,
                    c.didKill,
                    c.startFrame,
                    c.moves[c.moves.length - 1].frame,
                    c.moves.map(m => moveMappings[m.moveId] || 'other'),
                    c.moves.map(m => m.frame),
                    c.endFrame || c.startFrame + 100,
                    files[i],
                ])
            })
        }
    }

    return fullData;
}


module.exports = {
    vectorizeFilesV3
}