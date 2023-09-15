const { SlippiGame } = require("@slippi/slippi-js");
const slp = require("@slippi/slippi-js");
const crypto = require('crypto');
const fs = require('fs');
const { exec } = require('node:child_process')


exec(`rm -rf /tmp/tmp-*`);

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
            if (playerCode in sums) {
                sums[playerCode] += 1;
            } else {
                sums[playerCode] = 1;
            }
        }
    }
}

const playerCode = Object.keys(sums).reduce((a, b) => sums[a] > sums[b] ? a : b);

var queue = [];

for (var i = 0; i < 1; i++) {
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

    var stats = game.getStats();
    for (var j = 0; j < stats.conversions.length; j++) {
        if (stats.conversions[j].playerIndex === Number(opponentIndex)) {
            queue.push({
                path: files[i],
                startFrame: stats.conversions[j].startFrame,
                endFrame: stats.conversions[j].endFrame,
            })
        }
    }
}

const id = crypto.randomUUID()

const jsonInput = [{
    outputPath: `/home/nathan/Desktop/smash-sight/generated_videos/${id}.mp4`,
    queue,
}];

const jsonFilePath = `/home/nathan/Desktop/smash-sight/generated_json/${id}.json`;


fs.writeFileSync(jsonFilePath, JSON.stringify(jsonInput), function (err) {
    if (err) throw err;
    console.log('Saved!');
}); 


exec(`cd ../slp-to-video; node slp_to_video ${jsonFilePath}`)