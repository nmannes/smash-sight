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

var sums = {}
for (var i = 0; i < files.length; i++) {
    const game = new SlippiGame(files[i]);
    const metadata = game.getMetadata();
    if (metadata && metadata.players) {
        for (const key in metadata.players) {
            const playerCode = metadata.players[key].names.code;
            if (playerCode in sums){
                sums[playerCode] += 1;
            } else {
                sums[playerCode] = 1;
            }
        }
    }
}

const playerCode = Object.keys(sums).reduce((a, b) => sums[a] > sums[b] ? a : b);


for (var i = 0; i < files.length; i++) {
    const game = new SlippiGame(files[i]);
    const metadata = game.getMetadata();
    if (!metadata || !metadata.players || Object.keys(metadata.players).length !== 2){
        continue;
    }
    var playerIndex = '0'
    var opponentIndex = '1'
    if (metadata.players['0'].names.code !== playerCode) {
        playerIndex = '1'
        opponentIndex = '0'
    }

    //console.log(playerIndex);
    // const stats = game.getStats();
}

console.log('done!')