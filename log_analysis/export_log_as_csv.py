
import sys
sys.path.append('..')
from consts import MG_HOST, MG_PORT

from pymongo import MongoClient
client = MongoClient(MG_HOST, MG_PORT)
db = client.tti
log_col = db.log

import time
from datetime import datetime
import json

log_file_list = [
    'cytask1.json', 'cytask2.json',
    'phgtask1.json', 'phgtask2.json']

def create_csv():
    out_path = "export.csv"
    with open(out_path,'w') as outf:
        for log_fpath in log_file_list:
            log_list = json.load(open(log_fpath))
            for log in log_list:
                print log
                print >> outf, "%d, %s, %s"%(
                    log['user_id'],
                    log['action'],
                    str(datetime.fromtimestamp(log['timestamp']/1000.0))
                    )


def create_csv_from_db(uid_list, out_path):
    with open(out_path,'w') as outf:
        print>>outf,"trace, event, timestamp"
        for uid in uid_list:
            log_list = log_col.find({'user_id':uid})
            for log in log_list:
                print >> outf, "%d, %s, %s"%(
                    log['user_id'],
                    log['action'],
                    str(datetime.fromtimestamp(int(log['timestamp'])/1000.0))
                    )


if __name__ == '__main__':
    #create_csv()

    # cy, phg
    task1_uid_list = [24,28]
    task2_uid_list = [25,29]
    #create_csv_from_db(task1_uid_list, 'task1.csv')
    #create_csv_from_db(task2_uid_list, 'task2.csv')

    stage2_task1_uid_list = [41,44]
    stage2_task2_uid_list = [42,45]
    #create_csv_from_db(stage2_task1_uid_list, 'stage2task1.csv')
    create_csv_from_db(stage2_task2_uid_list, 'stage2task2.csv')
