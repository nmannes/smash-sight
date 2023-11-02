import sys
import os
import json
import pprint
from collections import OrderedDict 

run_id = sys.argv[-1]

data = json.loads(open('./generated_data/{}.json'.format(run_id), 'r').read())

# os.mkdir('./generated_videos/{}'.format(run_id))
video_data = []
output = []

for character in data.keys():
    # os.mkdir('./generated_videos/{}/{}'.format(run_id, character))
    if character != 'Captain Falcon':
        continue
    dd = {}
    for combo in data[character]:
        for i in range(len(combo[4])):
            key = f"{combo[4][:i]}"
            if key in dd:
                dd[key] += 1
            else:
                dd[key] = 1 
    for r in sorted(dd, key=dd.get, reverse=False):
        print(r, dd[r])


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