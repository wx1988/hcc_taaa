import sys
import pickle
from shapely.geometry import LineString, Point

from consolidate_lrs import cnty_rte2linestring

import numpy as np

sys.path.append('../')
from consts import MG_HOST
from pymongo import MongoClient
client = MongoClient(MG_HOST, 27017)

db = client.tti
acc_col = db.accident
veh_col = db.vehicle

rtn_col = db.route2
lrs_col = db.lrs


###########
# identify a region of interest for light weight prototype
###########
def group_case_by_cnty_rte():
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

########
# add each event to the corresponding roads
########
def process_one_event2seg(arm):
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

def add_event_2_seg():
    aid_rid_mp_list = []
    for acc in acc_col.find():
        aid_rid_mp_list.append([
            acc['caseno'], acc['cnty_rte'], acc['milepost'] ])

    for i,arm in enumerate(aid_rid_mp_list):
        if i % 100 == 0:
            print "processing ", i, "events"
        process_one_event2seg(arm)

def test_arm():
    arm = [102506561.0, u'7740001318', 10.257]
    process_one_event2seg(arm)

########
# This is about get the actual linestring for each segments
########
def cut_line(ls, beg, end):
    #print beg, end, ls.length
    # find the start position
    if end < beg:
        raise Exception(1)
    if beg < 0:
        raise Exception(2)
    if end > ls.length:
        raise Exception(3)
    coords = list(ls.coords)
    new_coords = []
    i = 0

    # find the beginning
    while ls.project(Point(coords[i])) < beg:
        i += 1
    if ls.project(Point(coords[i])) == beg:
        new_coords.append(coords[i])
        i += 1
    else:
        new_coords.append(ls.interpolate(beg))

    # add the following
    while ls.project(Point(coords[i])) < end:
        new_coords.append(coords[i])
        i += 1

    new_coords.append( ls.interpolate(end) )
    return LineString(new_coords)

def seg2ls_one(seg):
    # get the corresponding one in the lrs part
    cntyrte = seg['cntyrte']
    rid = cntyrte[2:] + cntyrte[0:2]
    route = lrs_col.find_one({'rid':rid})
    if not route:
        cnty_rte2linestring(rid)
        route = lrs_col.find_one({'rid':rid})
    mp_len = route['rlist'][-1]['endmp']

    # total length of each LRS
    pt_list = route['plist']
    ls = LineString(pt_list)
    unit = ls.length / mp_len
    beg = seg['begmp'] * unit
    end = seg['endmp'] * unit

    # transform back
    cut_ls = cut_line(ls, beg, end)
    tmp_plist = list(cut_ls.coords )
    #print tmp_plist
    #break
    rtn_col.update(
        {'_id':seg['_id']},
        {'$set':{'plist':tmp_plist}}
        )

def seg2ls():
    for seg in rtn_col.find({'plist':{'$exists':False}}):
        print seg['cntyrte']
        try:
            seg2ls_one(seg)
        except Exception as e:
            print e

def update_seg_bound():
    filter_cond = {
        '$and':[
            {'plist':{'$exists':True}},
            {'bound':{'$exists':False}}
            ]}
    for seg in rtn_col.find(filter_cond):
        print seg['_id']
        pt_mat = np.array(seg['plist'])
        #print pt_mat
        min_lng, min_lat = np.min(pt_mat, axis=0)
        max_lng, max_lat = np.max(pt_mat, axis=0)
        bound = {
            'top': max_lat,
            'down': min_lat,
            'left':min_lng,
            'right': max_lng}
        rtn_col.update(
            {'_id':seg['_id']},
            {'$set':{'bound':bound}})


def show_info():
    seginfo = pickle.load(open('seginfo.pkl','r'))

    sorted_seg_list = seginfo['sorted_seg_list']
    seg2caselist = seginfo['seg2caselist']

    for i in range(10):
        segid = sorted_seg_list[-1*i-1]
        print segid , len( seg2caselist[segid] )


if __name__ == "__main__":
    #group_case_by_cnty_rte()
    #show_info()
    #add_event_2_seg()
    #test()


    # re-run this function again to fill the empty things
    # due to depedency on another program to create lrs.
    # done by add function to create lrs that not exist
    #seg2ls()

    update_seg_bound()
