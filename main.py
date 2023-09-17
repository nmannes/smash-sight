import sys
import json
data = json.loads(open(sys.argv[-1], 'r').read())


for key in data.keys():
    print(key)