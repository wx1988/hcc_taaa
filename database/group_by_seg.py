"""
TODO, need to split into several files

This file mainly contain two functions:
1. Match each road segment with LRS to get the LineString representation
2. ???? Calculate the lat/lng of each accident
3. add index to get related events of one segment quickly
"""
import sys
import pickle
from shapely.geometry import LineString, Point
import numpy as np

sys.path.append('../')
from consts import MG_HOST, MG_PORT

from pymongo import MongoClient
client = MongoClient(MG_HOST, MG_PORT)
db = client.tti
acc_col = db.accident
veh_col = db.vehicle
rtn_col = db.route2
lrs_col = db.lrs

def process_one_event2seg(arm):
    """Add each event to the corresponding roads
    :param arm: three-size tuple, accident number, road id, milepost
    """
    #print arm
    condition = {"$and":[
            {'cntyrte':arm[1]},
            {'begmp':{'$lt': arm[2]}},
            {'endmp':{'$gt': arm[2]}}]
        }
    #print condition

    #print rtn_col.find_one({'cntyrte':arm[1]})
    r = rtn_col.find_one(condition)
    #print r

    if r:
        #print r, arm
        casenolist = []
        if 'casenolist' in r.keys():
            casenolist = r['casenolist']
        casenolist.append( arm[0] )
        rtn_col.update(
            {"_id":r['_id']},
            {"$set":{'casenolist':casenolist}})

def test_arm():
    """A manual test function for process_one_event2seg
    """
    arm = [102506561.0, u'7740001318', 10.257]
    process_one_event2seg(arm)

def add_event_2_seg():
    """Batch add the accident to the corresponding road segments
    """
    aid_rid_mp_list = []
    for acc in acc_col.find():
        aid_rid_mp_list.append([
            acc['caseno'], acc['cnty_rte'], acc['milepost'] ])

    for i,arm in enumerate(aid_rid_mp_list):
        if i % 100 == 0:
            print "processing ", i, "events"
        process_one_event2seg(arm)

if __name__ == "__main__":
    #group_case_by_cnty_rte()
    #find_max_accident_segs()

    #add_event_2_seg()
    #test()


    # re-run this function again to fill the empty things
    # due to depedency on another program to create lrs.
    # done by add function to create lrs that not exist
    #seg2ls()

    update_seg_bound()
