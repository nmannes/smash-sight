
import * as slp from "@slippi/slippi-js";
import { moveMappings } from './moves.js';

import * as druid from '@saehrimnir/druidjs';
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
    /*
    for (var key in filesByCharacter) {
        if (filesByCharacter[key].length < 20) {
            delete filesByCharacter[key]
        }
    }
    */
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

function vectorizePlayers(indexedGame, conversion, frames) {
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

    for (var i = 1; i < 10; i++) {
        const preFrame = frames[frameAnalysisEnd - (3 * i)]
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

export function analyzeFiles(files) {
    const playerCode = getPlayerCode(files);

    const groupedGames = splitBy(files, playerCode);

    for (char in groupedGames) {
        const fileList = groupedGames[char];
        if (char !== 'Dr. Mario') {
            continue;
        }
        let data = [];
        for (var i = 0; i < fileList.length; i++) {
            if (i % 10 === 0) {
                console.log(i, fileList.length);
            }
            const indexedGame = indexGame(files[i], playerCode);
            const settings = indexedGame.game.getSettings();
            const stats = indexedGame.game.getStats();
            const frames = indexedGame.game.getFrames();
            for (var j = 0; j < stats.conversions.length; j++) {
                const conversion = stats.conversions[j];
                if (!(conversion.playerIndex === indexedGame.opponentIndex && conversion.openingType === 'neutral-win')) {
                    continue;
                }

                data.push([
                    conversion.didKill ? 1 : 0,
                    vectorizeStage(settings.stageId),
                    vectorizeMove(conversion.moves[0].moveId),
                    vectorizePlayers(indexedGame, conversion, frames),
                ].flat())
            }
        }
        let matrix = druid.Matrix.from(data);
        console.log(matrix.to2dArray);
    }


    return {}
}