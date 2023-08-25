const { SlippiGame } = require("@slippi/slippi-js");
const fs = require('fs');

const path = '/home/nathan/Desktop/smash-sight/replays';
var files = [];
fs.readdirSync(path).forEach(month => {
    const folderPath = `${path}/${month}`;
    fs.readdirSync(folderPath).forEach(file => {
        files.push(`${folderPath}/${file}`);
    })
});

// determines player name to analyze


const vectorizeConversion = (gameMetadata, moveList, frames, playerIndex) => {


}

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
}

const playerCode = Object.keys(sums).reduce((a, b) => sums[a] > sums[b] ? a : b);

var counts = {}

for (var i = 0; i < files.length; i++) {
    if (i % 15 === 0){
        console.log(i / files.length)
    }
    const game = new SlippiGame(files[i]);
    const metadata = game.getMetadata();
    if (!metadata || !metadata.players || Object.keys(metadata.players).length !== 2) {
        continue;
    }

    var playerIndex = '0'
    var opponentIndex = '1'
    if (metadata.players['0'].names.code !== playerCode) {
        playerIndex = '1'
        opponentIndex = '0'
    }

    var oppoChar = metadata.players[opponentIndex].characters;
    var stats = game.getStats();

    for (var j = 0; j < stats.conversions.length; j++) {
        if (stats.conversions[j].playerIndex === Number(opponentIndex)) {
            // todo: figure out ratio of neutral-win/counterattack
            // for each character
            counts[oppoChar] ||= {};
            counts[oppoChar]['neutral-win'] ||= 0;
            counts[oppoChar]['counter-attack'] ||= 0;
            counts[oppoChar][stats.conversions[j].openingType] += 1;
        }
    }
}
console.log(counts)



/*
export declare enum Character {
    CAPTAIN_FALCON = 0,
    DONKEY_KONG = 1,
    FOX = 2,
    GAME_AND_WATCH = 3,
    KIRBY = 4,
    BOWSER = 5,
    LINK = 6,
    LUIGI = 7,
    MARIO = 8,
    MARTH = 9,
    MEWTWO = 10,
    NESS = 11,
    PEACH = 12,
    PIKACHU = 13,
    ICE_CLIMBERS = 14,
    JIGGLYPUFF = 15,
    SAMUS = 16,
    YOSHI = 17,
    ZELDA = 18,
    SHEIK = 19,
    FALCO = 20,
    YOUNG_LINK = 21,
    DR_MARIO = 22,
    ROY = 23,
    PICHU = 24,
    GANONDORF = 25,
    MASTER_HAND = 26,
    WIREFRAME_MALE = 27,
    WIREFRAME_FEMALE = 28,
    GIGA_BOWSER = 29,
    CRAZY_HAND = 30,
    SANDBAG = 31,
    POPO = 32
}
*/