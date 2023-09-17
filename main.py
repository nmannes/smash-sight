import sys
import os
import json
import matplotlib.pyplot as plt
from sklearn.cluster import AffinityPropagation

run_id = sys.argv[-1]
data = json.loads(open('{}.json'.format(run_id), 'r').read())


os.mkdir('./generated_videos/{}'.format(run_id))
video_data = []

output = []
for character in data.keys():
    os.mkdir('./generated_videos/{}/{}'.format(run_id, character))
    print(character)
    clustering = AffinityPropagation(random_state=5).fit(data[character]['data'])
    clusters = {}
    for i, cluster in enumerate(clustering.labels_):
        if cluster in clusters:
            clusters[cluster].append(data[character]['label'][i])
        else:
            clusters[cluster] = [data[character]['label'][i]]
    queue = []
    for key, clip in clusters:
        queue.append({
            "path": clip[4],
            "startFrame": clip[2],
            "endFrame": clip[3],
        })
    output.append({
        "outputPath": "./generated_videos/{}/{}-{}.mp4".format(run_id, character, key),
        "queue": queue, 
    })

f = open('./generated_json/{}.json'.format(run_id))
f.write(json.dumps(output))
f.close()