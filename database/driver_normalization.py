"""
Normalize driver information
For each caseno, find the first vehno = 1
get drv_age, drv_sex
"""
import sys
sys.path.append('..')
from consts import MG_HOST, MG_PORT

from pymongo import MongoClient
client = MongoClient(MG_HOST, MG_PORT)
db = client.tti
acc_col = db.accident
veh_col = db.vehicle

def batch_process_driver():
    """
    First get all case to process
    Get the first vehicle
    """
    caseno_list = []
    for acc in acc_col.find({'drv_age':{'$exists':False}}):
        caseno_list.append( acc['caseno'] )

    for caseno in caseno_list:
        try:
            veh = veh_col.find_one({'caseno':caseno, 'vehno':1})
            acc_col.update(
                {'caseno':caseno},
                {'$set':{
                    'drv_age':veh['drv_age'],
                    'drv_sex':veh['drv_sex']
                    }})
        except Exception as e:
            print e

if __name__ == '__main__':
    batch_process_driver()
