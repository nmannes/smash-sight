const crypto = require('crypto');
const fs = require('fs');
var { exec, execSync } = require('child_process');
const { vectorizeFilesV3 } = require('./utils');


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
const gameData = vectorizeFilesV3(files);
const id = crypto.randomUUID()


fs.writeFileSync(`./generated_data/${id}.json`, JSON.stringify(gameData))

/*
console.log('running python analysis');

execSync(`python3 main.py ${id}`, (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    if (error !== null) {
        console.log(`exec error: ${error}`);
    }   
});
console.log('generating replays')

const jsonFilePath = `/home/nathan/Desktop/smash-sight/generated_json/${id}.json`;

execSync(`cd ../slp-to-video; node slp_to_video ${jsonFilePath}`, (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    if (error !== null) {
        console.log(`exec error: ${error}`);
    }   
});

*/
