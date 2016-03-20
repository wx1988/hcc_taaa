"""
All action related with database operation here
"""

from hsis_codebook import *

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
#https://api.mongodb.org/python/current/examples/authentication.html
#client = MongoClient('mongodb://hcc:tti@54.201.125.48')
#client = MongoClient('mongodb://hcc:tti@54.201.125.48:27117')
#client = MongoClient('54.201.125.48', 27117)
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
		return True
	else:
		return False

def create_new_link(cl_info):
	cl_col.insert(cl_info)

def get_links(caseno, user_id):
	res = []
	for l in cl_col.find({'caseno':caseno,'user_id':user_id}):
		res.append(l)
	return res

