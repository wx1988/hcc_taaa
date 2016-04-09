"""
All action related with database operation here
"""
import copy

from hsis_codebook import *
from consts import MG_HOST, MG_PORT

from pymongo import MongoClient
client = MongoClient(MG_HOST, MG_PORT)

db = client.tti
acc_col = db.accident
veh_col = db.vehicle
route_col = db.route2
rtn_col = db.route2
cl_col = db.causal_links

######
# accidents part
######
def get_acc_raw_by_caseno(caseno):
    data = {}
    acc = acc_col.find_one( {'caseno':caseno} )
    if not acc:
        return "Not found"
    del acc['_id']
    data['acc'] = acc#replace_acc_coding(acc)

    veh_cur = veh_col.find({'caseno':caseno})
    veh_list = []
    for veh in veh_cur:
        del veh['_id']
        #veh = replace_veh_coding(veh)
        veh_list.append(veh)
    data['veh_list'] = veh_list

    r = route_col.find_one({'cntyrte':acc['cnty_rte']})
    del r['_id']
    for k in r.keys():
        r[k] = str(r[k])
    data['route'] = r

    #print r

    return data

def get_acc_info_by_caseno(caseno):
    """
    get the accident infor by case number
    """
    data = {}
    acc = acc_col.find_one( {'caseno':caseno} )
    if not acc:
        return "Not found"
    del acc['_id']
    data['acc'] = replace_acc_coding(acc)

    veh_cur = veh_col.find({'caseno':caseno})
    veh_list = []
    for veh in veh_cur:
        del veh['_id']
        veh = replace_veh_coding(veh)
        veh_list.append(veh)
    data['veh_list'] = veh_list
    return data


def get_accidents_by_bound(bound):
    """
    get all accident within the range
    """

    # TODO, create index on these field
    filter_dict = {
		    'lat':{
                '$gt':float(bound['down']),
                '$lt':float(bound['top']) },
		    'lng':{
                '$gt':float(bound['left']),
                '$lt':float(bound['right'])},
		    }

    print filter_dict

    acc_iter = acc_col.find(filter_dict)
    acc_info_list = []
    for acc in acc_iter:
        # TODO, too slow here
        #acc_info = get_acc_info_by_caseno( acc['caseno'] )

        # the following version might be faster
        acc_info = copy.copy(acc)
        del acc_info['_id']
        acc_info_list.append( acc_info )
    return acc_info_list

#####
# road parts
#####
def get_segs_by_rid(rid):
    return None

def get_segs_by_bound(bound):
    """
    bound, dictionary containing up, down, left, right
    """
    # TODO, check intersection rule
    # NOTE, this rule is not OK.
    filter_dict = { '$or' : [
            { 'bound.top': {'$gt':bound['down']} },
            { 'bound.down': {'$lt':bound['top']} },
            { 'bound.left': {'$lt':bound['right']} },
            { 'bound.right': {'$gt':bound['left']} }
        ]}
    #print filter_dict
    rtn_list = []
    for rtn in rtn_col.find(filter_dict):
        rtn['id'] = str(rtn['_id'])
        rtn['yradd'] = str(rtn['yradd'])
        rtn['yr_impr1'] = str(rtn['yr_impr1'])

        del rtn['_id']
        rtn_list.append(rtn)
    return rtn_list
    """
    lrs_iter = lrs_col.find(filter_dict)
    road_list = []
    for lrs in lrs_iter:
        # TODO, get segments of this roads here
        seg_list = get_segs_by_rid(lrs['rid'])
        road_list.append(seg_list)
    return road_list
    """

####
# causal links part
####
def check_link_exists(cl_info):
    check_exist = cl_col.find_one(cl_info)
    if check_exist:
        return True#str(check_exist['_id'])
    else:
        return False

def get_link_id(cl_info):
    check_exist = cl_col.find_one(cl_info)
    if check_exist:
        return str(check_exist['_id'])
    else:
        return None


def create_new_link(cl_info):
    cl_col.insert(cl_info)


def get_links_by_case_user(caseno, user_id):
    res = []
    for l in cl_col.find({'caseno':caseno,'user_id':user_id}):
        l['id'] = str(l['_id'])
        del l['_id']
        res.append(l)
        # TODO, decode the informatio here

    return res

def update_graph(caseno, user_id):
    from graph_visual import gen_svg_graph_neat_warper
    outpath = "static/imgs/tmp/"+str(caseno)+'-'+str(user_id)+'.png'
    gen_svg_graph_neat_warper(caseno, user_id, outpath)
