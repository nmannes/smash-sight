import sys
import os
import json


run_id = sys.argv[-1]

data = json.loads(open('./generated_data/{}.json'.format(run_id), 'r').read())

# os.mkdir('./generated_videos/{}'.format(run_id))
video_data = []
output = []

for character in data.keys():
    # os.mkdir('./generated_videos/{}/{}'.format(run_id, character))
    for combo in data[character]:
        print(combo)
        break

        '''
        queue = []
        for conv in clusters[key]:
            if totalFrames > 60 * 20:
                break
            queue.append({
                "path": conv[4],
                "startFrame": conv[2],
                "endFrame": conv[3],
            })
            totalFrames += conv[3] - conv[2]
        output.append({
            "outputPath": "./generated_videos/{}/{}-{}.mp4".format(run_id, character, key),
            "queue": queue, 
        })
        cluster_count += 1

f = open('./generated_json/{}.json'.format(run_id), 'w')
f.write(json.dumps(output))
f.close()
        '''