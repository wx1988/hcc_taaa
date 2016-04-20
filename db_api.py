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
log_col = db.log

######
# accidents part
######
def get_acc_raw_by_caseno(caseno):
    """This function will return the detail information about an accident given the caseno. 

    :param caseno: The case number of the accident
    :returns: A dictionary containing the accident basic information, involved vehicles, and road information.
    """
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

####
# log part
####
def create_log(log_entry):
    log_col.insert(log_entry)

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
    filter_dict = { '$not' : {
        '$and':
            [
                { 'bound.top': {'$lt':bound['down']} },
                { 'bound.down': {'$gt':bound['top']} },
                { 'bound.left': {'$gt':bound['right']} },
                { 'bound.right': {'$lt':bound['left']} }
            ]
        }}
    # check two reference point in the bound
    # 1. top left
    cond1 = {'$and':[
                {'bound.top': {'$lt': bound['top']}},
                {'bound.top': {'$gt': bound['down']}},
                {'bound.left': {'$lt': bound['right']}},
                {'bound.left': {'$gt':bound['left']}}
            ]}

    # 2. down right
    cond2 = {'$and':[
                {'bound.down': {'$lt': bound['top']}},
                {'bound.down': {'$gt': bound['down']}},
                {'bound.right': {'$lt': bound['right']}},
                {'bound.right': {'$gt':bound['left']}}
            ]}
    filter_dict = {'$or':[cond1, cond2]}

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


def example_export_csv():
    from hsis_codebook import event as event_dict
    from hsis_codebook import loc_type as loc_type_dict
    bound = {'left':-78.1, 'right':-78, 'top':35.1, 'down':35}
    acc_list = get_accidents_by_bound(bound)

    acc_fields = ['acc_date', 'time', 'lat','lng','weather1','light', 'rdsurf']
    head_line = ''
    for acc_field in acc_fields:
        head_line += acc_field +','
    head_line += "Intersection, "
    head_line += "Road Segment,"
    head_line += "HeadOn,"
    head_line += "RearEnd,"
    head_line += "Collision,"
    #head_line += "\n"

    light2count = {}
    collision2count = {}


    content = ""
    for acc in acc_list:
        tmp_line = ""
        for acc_field in acc_fields:
            tmp_line += str( acc[ acc_field ]  )+','

        # whether intersection related
        print acc['loc_type']
        if not np.isnan(acc['loc_type']) and \
            loc_type_dict[ acc['loc_type'] ].count("Intersection") > 0:
            tmp_line += "1,"
        else:
            tmp_line += "0,"

        # the segments
        find_seg_dict = {
                    'cntyrte': acc['cnty_rte'],
                    'begmp': {'$lt': acc['milepost']},
                    'endmp': {'$gt': acc['milepost']}}
        seg = rtn_col.find_one(find_seg_dict)
        if seg:
            tmp_line += str(seg['_id'])+','
        else:
            tmp_line += ','

        # head on
        # rear end
        head_on = 0
        rear_end = 0
        soe_list_str = "\""
        for soe in acc['events']:
            if event_dict[ soe].lower().count("head on") > 0:
                head_on = 1
            if event_dict[ soe].lower().count("rear end") > 0:
                rear_end = 1
            soe_list_str += str(int(soe))+","
        if head_on:
            tmp_line += "1,"
        else:
            tmp_line += "0,"

        if rear_end:
            tmp_line += "1,"
        else:
            tmp_line += "0,"

        soe_list_str = soe_list_str[:-1]+"\""
        tmp_line += soe_list_str

        content += tmp_line + "\n"

        # for statistics
        if not light2count.has_key( acc['light'] ):
            light2count[ acc['light'] ] = 0
        light2count[ acc['light'] ] += 1
        #print acc['events']
        for soe in acc['events']:
            if not collision2count.has_key(soe):
                collision2count[soe] = 0
            collision2count[soe] +=1

    with open('tmp.csv', 'w') as f:
        print>>f, head_line
        print>>f, content

    # print the data
    print light2count

    soe_list = collision2count.keys()
    soe_list = sorted(soe_list, key=lambda k: -1*collision2count[k])
    for soe in soe_list:
        print "['%s',%d],"%(event_dict[soe], collision2count[soe])

if __name__ == "__main__":
    example_export_csv()
