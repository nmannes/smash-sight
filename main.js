import 'crypto';
import 'fs';
import 'node:child_process';

import analyzeFiles from './utils.js';


exec(`rm -rf /tmp/tmp-*`);

const path = '/home/nathan/Desktop/smash-sight/replays';
var files = [];
fs.readdirSync(path).forEach(month => {
    const folderPath = `${path}/${month}`;
    fs.readdirSync(folderPath).forEach(file => {
        files.push(`${folderPath}/${file}`);
    })
});

const analyzedGames = utils.analyzeFiles(files)
const jsonInput = [];
const id = crypto.randomUUID()

for (key in analyzedGames) {
    jsonInput.push(
        {
            outputPath: `/home/nathan/Desktop/smash-sight/generated_videos/${id}-${key}.mp4`,
            queue: analyzedGames[key],
        }
    )
}


const jsonFilePath = `/home/nathan/Desktop/smash-sight/generated_json/${id}.json`;


fs.writeFileSync(jsonFilePath, JSON.stringify(jsonInput), function (err) {
    if (err) throw err;
    console.log('Saved!');
});


exec(`cd ../slp-to-video; node slp_to_video ${jsonFilePath}`)