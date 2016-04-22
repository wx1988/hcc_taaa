import sys
sys.path.append("../")
from consts import MG_HOST, MG_PORT

import numpy as np
from pymongo import MongoClient
client = MongoClient( MG_HOST, MG_PORT )
db = client.tti
acc_col = db.accident
veh_col = db.vehicle
rtn_col = db.route2


def batch_process_driver():
    """First get all case to process, Get the first vehicle as the corresponding vehicle
    Normalize driver information. For each caseno, find the first vehno = 1. 
    Information drv_age, drv_sex
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


def consolidate_injury():
    """consolidate the injury of each vehicle and put information in the accident collection
    """
    # get all caseno
    caseno_list = []
    for acc in acc_col.find({'num_k':{'$exists':False}}):
        caseno_list.append( acc['caseno'] )

    # find all vehicle, get the number and consolidate
    for caseno in caseno_list:
        try:
            vehs = veh_col.find({'caseno':caseno})
            nk,na,nb,nc = 0,0,0,0
            for veh in vehs:
                nk += veh['num_k']
                na += veh['num_a']
                nb += veh['num_b']
                nc += veh['num_c']

            acc_col.update(
                {'caseno':caseno},
                {'$set':{
                    'num_k':nk,
                    'num_a':na,
                    'num_b':nb,
                    'num_c':nc,
                    }})
        except Exception  as e:
            print e

def consolidate_colision_type():
    """colision type is summarized based on the sequence of events 
    """
    caseno_list = []
    for acc in acc_col.find({'events':{'$exists':False}}):
        caseno_list.append( acc['caseno'] )

    # find all vehicle, get the number and consolidate
    for caseno in caseno_list:
        try:
            vehs = veh_col.find({'caseno':caseno})
            events = []
            for veh in vehs:
                for i in range(1,5):
                    if not np.isnan(veh['event'+str(i)]):
                        events.append(veh['event'+str(i)])
            events = list(set(events))
            #print events
            #break
            acc_col.update(
                {'caseno':caseno},
                {'$set':{'events':events}})
        except Exception  as e:
            print e

if __name__ == "__main__":
    #consolidate_injury()
    consolidate_colision_type()
