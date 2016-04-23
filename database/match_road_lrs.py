import sys
sys.path.append('../')

from consts import PG_HOST, PG_DB, PG_USER, PG_PASSWD
from consts import MG_HOST, MG_PORT

import psycopg2
from pymongo import MongoClient

client = MongoClient(MG_HOST, MG_PORT)
db = client.tti
acc_col = db.accident
lrs_col = db.lrs

from shapely.wkt import loads as wkt_loads
from shapely.geometry import LineString

def cnty_rte2linestring(rid):
    """Consolidate accident road dataset with the LRS system
    :param rid: the road id of interest
    """
    rte_info = lrs_col.find_one({'rid':rid})
    if rte_info:
        return rte_info

    # first reformat the rid
    # move the first two id to the end
    # 2530000024 -> 3000002425
    new_rid = rid
    conn = psycopg2.connect("dbname='%s' user='%s' host='%s' password='%s'"%(PG_DB, PG_USER, PG_HOST, PG_PASSWD) )
    sql = "select begmp1, endmp1, st_astext(geom) from ncdot84 where rte_id = '%s' order by begmp1;"%(new_rid)
    cur = conn.cursor()
    cur.execute(sql)
    rows = cur.fetchall()
    rlist = []
    plist = []
    for row in rows:
        row_info = {
                'begmp': float(row[0]),
                'endmp': float(row[1]),
                'linestring': row[2]
                }

        # construct the whole linestring
        wkt_ls = wkt_loads( row[2] )
        seg_plist = list( wkt_ls[0].coords )
        plist.extend( seg_plist )
        rlist.append(row_info)
    rte_info = {'rid':rid, 'rlist': rlist, 'plist':plist}
    lrs_col.insert(rte_info)
    return rte_info

def cut_line(ls, beg, end):
    """ cut the line string given the start and end location
    :param ls: line string
    :param beg: start point for cutting
    :param end: end point for cutting
    """
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
    """Given a line segment, get the corresponding line segment and update the database
    :param seg: the line segment
    """
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

def batch_seg2ls():
    """Batch entrance to convert the segment into line string
    """
    for seg in rtn_col.find({'plist':{'$exists':False}}):
        print seg['cntyrte']
        try:
            seg2ls_one(seg)
        except Exception as e:
            print e

def update_seg_bound():
    """Pre-caculate the bounding box for fast filtering
    """
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


