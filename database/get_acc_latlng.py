import sys
sys.path.append('../')

from consts import MG_HOST, MG_PORT

from pymongo import MongoClient

client = MongoClient(MG_HOST, MG_PORT)
db = client.tti
acc_col = db.accident
lrs_col = db.lrs

from shapely.wkt import loads as wkt_loads
from shapely.geometry import LineString

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
