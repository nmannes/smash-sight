import sys
import json
import matplotlib.pyplot as plt
from sklearn.cluster import AffinityPropagation


data = json.loads(open(sys.argv[-1], 'r').read())

video_data = []
for key in data.keys():
    print(key)
    clustering = AffinityPropagation(random_state=5).fit(data[key]['data'])
    print(clustering.labels_)

   