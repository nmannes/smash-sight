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


// Get metadata - start time, platform played on, etc
files.forEach( file => {
    const game = new SlippiGame(file);
    const settings = game.getSettings();
    const metadata = game.getMetadata();
})

console.log('done!')