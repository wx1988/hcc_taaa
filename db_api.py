"""
All action related with database operation here
"""

from hsis_codebook import *

from pymongo import MongoClient
#client = MongoClient('localhost', 27017)
client = MongoClient('128.194.140.206', 27017)

db = client.tti
acc_col = db.accident
veh_col = db.vehicle
cl_col = db.causal_links


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
