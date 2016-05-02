import sys
sys.path.append('..')
from consts import MG_HOST, MG_PORT

from pymongo import MongoClient
client = MongoClient(MG_HOST, MG_PORT)
db = client.tti
acc_col = db.accident

def batch_age_convert():
    for acc in acc_col.find({'n_drv_age':{'$exists':False}}):
        try:
            acc_col.update(
                    {'caseno':acc['caseno']},
                    {'$set':{
                        'n_drv_age': int(acc['drv_age'])
                        }})
        except Exception as e:
            print acc, e

if __name__ == "__main__":
    batch_age_convert()
