const crypto = require('crypto');
const fs = require('fs');
var { exec, spawn } = require('child_process');
const { vectorizeFiles } = require('./utils');


exec(`rm -rf /tmp/tmp-*`);

const path = '/home/nathan/Desktop/smash-sight/replays';
var files = [];
fs.readdirSync(path).forEach(month => {
    const folderPath = `${path}/${month}`;
    fs.readdirSync(folderPath).forEach(file => {
        files.push(`${folderPath}/${file}`);
    })
});
console.log('vectorizing files');
const gameData = vectorizeFiles(files);
const id = crypto.randomUUID()


fs.writeFileSync(dataPath, JSON.stringify(gameData))

console.log('running python analysis')

spawn('python3', ['main.py', id], { stdio: 'inherit' });

console.log('generating replays')

const jsonFilePath = `/home/nathan/Desktop/smash-sight/generated_json/${id}.json`;

fs.writeFileSync(jsonFilePath, JSON.stringify(jsonInput), function (err) {
    if (err) throw err;
    console.log('Saved!');
});


exec(`cd ../slp-to-video; node slp_to_video ${jsonFilePath}`)