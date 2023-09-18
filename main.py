import sys
import os
import time
import json
import matplotlib.pyplot as plt
from sklearn.cluster import AffinityPropagation

run_id = sys.argv[-1]

data = json.loads(open('./generated_data/{}.json'.format(run_id), 'r').read())

MAX_CLUSTER_COUNT = 15

# os.mkdir('./generated_videos/{}'.format(run_id))
video_data = []
output = []

for character in data.keys():
    # os.mkdir('./generated_videos/{}/{}'.format(run_id, character))
    clustering = AffinityPropagation(random_state=5).fit(data[character]['data'])
    clusters = {}
    for i, cluster in enumerate(clustering.labels_):
        if cluster in clusters:
            clusters[cluster].append(data[character]['labels'][i])
        else:
            clusters[cluster] = [data[character]['labels'][i]]
    print(character, len(clusters.keys()))
    cluster_count = 0
    for key in clusters:
        if cluster_count >= MAX_CLUSTER_COUNT:
            break
        totalFrames = 0
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