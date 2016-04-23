import sys
import pickle
from shapely.geometry import LineString, Point
import numpy as np

sys.path.append('../')
from consts import MG_HOST, MG_PORT
from consolidate_lrs import cnty_rte2linestring

from pymongo import MongoClient
client = MongoClient(MG_HOST, MG_PORT)
db = client.tti
acc_col = db.accident
veh_col = db.vehicle
rtn_col = db.route2
lrs_col = db.lrs

def group_case_by_cnty_rte():
    """This function is intended to find interest road segment for the lightweight prototype
    However, it is not useful
    """
    seg2caselist = {}
    for acc in acc_col.find():
        if not seg2caselist.has_key( acc['cnty_rte'] ):
            seg2caselist[acc['cnty_rte']] = []
        seg2caselist[acc['cnty_rte']].append( acc['caseno'] )

    seg_list = seg2caselist.keys()
    seg_list = sorted( seg_list, key=lambda s: len(seg2caselist[s]) )
    res = {
        'sorted_seg_list': seg_list,
        'seg2caselist': seg2caselist
    }
    with open('seginfo.pkl','w') as f:
        pickle.dump( res, f)

def find_max_accident_segs():
    """Find segments with the largest accident rates
    """
    seginfo = pickle.load(open('seginfo.pkl','r'))
    sorted_seg_list = seginfo['sorted_seg_list']
    seg2caselist = seginfo['seg2caselist']

    for i in range(10):
        segid = sorted_seg_list[-1*i-1]
        print segid , len( seg2caselist[segid] )


