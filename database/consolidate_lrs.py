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

def acc2latlng(caseno):
    """Calculate the latitude/longitude and update into mongodb

    :param caseno: case number of the accident
    """
    # get the cnty_rte and mile post
    acc = acc_col.find_one({'caseno':caseno})

    # check exists
    if 'lat' in acc.keys() and 'lng' in acc.keys():
        return

    rte_nbr = acc['rte_nbr']
    cnty_rte = acc['cnty_rte']
    milepost = acc['milepost']
    if cnty_rte.index(rte_nbr) != 2:
        raise Exception("Unknown format")

    # get the road information
    rid = rte_nbr + cnty_rte[0:2]
    r_info = cnty_rte2linestring(rid)
    max_mp = r_info['rlist'][-1]['endmp']
    ls = LineString( r_info['plist'] )
    deg_mp = milepost / max_mp * ls.length # mile to degree
    acc_pos = ls.interpolate( deg_mp )
    lng = acc_pos.coords[0][0]
    lat = acc_pos.coords[0][1]
    #print ls
    #print acc_pos
    # TODO, update the lat lng information
    acc_col.update(
            {'caseno':caseno},
            {'$set':{'lat':lat, 'lng':lng}}
            )

def batch_acc2latlng():
    """Batch caculate the lat/lng of accidents
    """
    caseno_list = []
    for acc in acc_col.find():
        caseno_list.append( acc['caseno'] )
    for caseno in caseno_list:
        try:
            acc2latlng(caseno)
        except Exception as e:
            print e


if __name__ == "__main__":
    rid = '1000007759'
    #cnty_rte2linestring(rid)
    #acc2latlng(102482979)
    batch_acc2latlng()
