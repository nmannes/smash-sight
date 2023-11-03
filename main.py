import os
import sys
import json
import pygtrie as trie

run_id = sys.argv[-1]

data = json.loads(open('./generated_data/{}.json'.format(run_id), 'r').read())

os.mkdir('./generated_videos/{}'.format(run_id))
video_data = []
output = []

for character in data.keys():
    if character is not 'Captain Falcon':
        continue
    os.mkdir('./generated_videos/{}/{}'.format(run_id, character))
    st = trie.StringTrie()
    for combo in list(sorted(data[character], key= lambda a: len(a[4]))):
        moves = combo[4]
        for i, hit in enumerate(moves):
            l = moves[:i]
            if len(l) > 0:
                key = f"{'/'.join(l)}"
                if not st.has_node(key):
                    st[key] = []
                if i == len(moves) - 1:
                    st[key].append([combo[-1], max(0, combo[3]-30), combo[-2]])
        
    display = sorted(list(st.iteritems()), reverse=True, key=lambda a: len(a[1]))[:15]
    
    queue = []
    totalFrames = 0
    for conv in display:
        gameData = conv[1]
        for hit in gameData:
            if totalFrames > 60 * 20:
                break
            print(gameData)
            queue.append({
                "path": hit[0],
                "startFrame": hit[1],
                "endFrame": hit[2],
            })
            totalFrames += hit[2] - hit[1]
    output.append({
        "outputPath": "./generated_videos/{}/{}-{}.mp4".format(run_id, character, key),
        "queue": queue, 
    })

f = open('./generated_json/{}.json'.format(run_id), 'w')
f.write(json.dumps(output))
f.close()