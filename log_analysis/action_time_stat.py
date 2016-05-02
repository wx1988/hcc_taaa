"""
Make statistics on the action time
"""
import datetime

def action_time(log_file):
    print log_file
    uid2min = {}
    uid2max = {}
    lines = open(log_file).readlines()
    lines = lines[1:]
    for line in lines:
        ws = line.strip().split(',')
        uid = int(ws[0])
        #d = datetime.datetime.strptime(ws[2][:-4], '%Y-%m-%d %H:%M:%S')
        d = datetime.datetime.strptime(ws[2].strip(), '%Y-%m-%d %H:%M:%S.%f')
        if not uid2min.has_key( uid ):
            uid2min[uid] = d
        if d < uid2min[uid]:
            uid2min[uid] = d
        if not uid2max.has_key( uid ):
            uid2max[uid] = d
        if d > uid2max[uid]:
            uid2max[uid] = d
    print uid2min, uid2max
    for uid in uid2min.keys():
        print uid, (uid2max[uid] - uid2min[uid]).total_seconds()

if __name__ == "__main__":
    action_time('stage2task1.csv')
    action_time('stage2task2.csv')
