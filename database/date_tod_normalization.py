"""
Normalize date and time of day
acc_date, time
"""
import sys
sys.path.append('..')
from consts import MG_HOST, MG_PORT

from pymongo import MongoClient
client = MongoClient(MG_HOST, MG_PORT)
db = client.tti
acc_col = db.accident
from datetime import date, datetime, timedelta


def batch_process_dt():
    """ Convert the string date and time to integer seconds
    acc_date -> n_acc_date
    time -> n_time
    """
    caseno_list = []
    for acc in acc_col.find({'n_acc_date':{'$exists':False}}):
        #for acc in acc_col.find():
        ws = acc['acc_date'].split('/')
        MM = int(ws[0])
        DD = int(ws[1])
        YYYY = int(ws[2])

        time_str = acc['time']
        colon_pos = time_str.index(":")
        hour = int( time_str[0:colon_pos] )
        minute = int( time_str[colon_pos+1:time_str.index(' ', colon_pos)])

        if acc['time'].count('AM') > 0:
            if hour == 12:
                hour = 0
        else:
            if hour != 12:
                hour += 12

        seconds = hour * 60*60 + minute*60
        #print acc, YYYY, MM, DD, hour, minute

        timestamp = (datetime( YYYY, MM, DD, hour, minute ) - \
            datetime(1970, 1, 1, )).total_seconds()+1
        #print acc, timestamp, seconds, date.fromtimestamp(timestamp)
        #break
        acc_col.update(
            {'caseno': acc['caseno']},
            {'$set':{
                'n_acc_date': timestamp,
                'n_time': seconds
            }})

if __name__ == '__main__':
    batch_process_dt()
