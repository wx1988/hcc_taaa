
"""
Prepare the filter from the user request to the mongodb filtering
"""
import copy
from datetime import datetime
from consts import DEBUG

"""
Accident filtering part
"""
def af_bound(webinput):
    """set up the boundary filter for mongodb query
    :param webinput: dictionary, related keys up/down/left/right
    :returns: dictionary, mongodb filter dictionary
    """
    tmp_dic = {
            'lat':{
                '$gt':float(webinput['down']),
                '$lt':float(webinput['top'])},
            'lng':{
                '$gt':float(webinput['left']),
                '$lt':float(webinput['right'])
                }
            }
    return tmp_dic

def af_collision_type(webinput):
    """set up the collision type filter for mongodb query
    check whether there is intersection with events field

    TODO, check whether the logic is correct for
    array element matching
    https://docs.mongodb.org/manual/tutorial/query-documents/#match-an-array-element

    :param webinput: dictionary, related keys collision
    :returns: dictionary, mongodb filter dictionary
    """
    if not webinput.has_key('collision'):
        return {}
    collision_list = []
    for k in webinput['collision']:
        collision_list.append(int(k))
    if len(collision_list) == 0:
        return {}
    tmp_dic = {'events':{'$in':collision_list}}
    return tmp_dic

def af_date_range(webinput):
    """set up the date range filter for mongodb query
    check whether there is intersection with events field

    For the database part, need convert the date string to date object

    :param webinput: dictionary, related keys date_range
    :returns: dictionary, mongodb filter dictionary
    """
    start_date = webinput['date_range'][0]
    s_MM, s_DD, s_YYYY = [int(w) for w in start_date.split('/')]
    end_date = webinput['date_range'][1]
    e_MM, e_DD, e_YYYY = [int(w) for w in end_date.split('/')]
    if s_YYYY == -1 and e_YYYY == -1:
        return {}

    if DEBUG:
        print s_YYYY, s_MM, s_DD
        print e_YYYY, e_MM, e_DD

    tmp_dic = {}
    tmp_dic['n_acc_date'] = {}
    if s_YYYY != -1:
        s_timestamp = (datetime( s_YYYY, s_MM, s_DD, 0, 0 ) - \
                datetime(1970, 1, 1, )).total_seconds()
        tmp_dic['n_acc_date']['$gte'] = s_timestamp
    if e_YYYY != -1:
        e_timestamp = (datetime( e_YYYY, e_MM, e_DD, 23, 59 ) - \
                datetime(1970, 1, 1, )).total_seconds()
        tmp_dic['n_acc_date']['$lte'] = e_timestamp
    return tmp_dic


def af_tod_range(webinput):
    # time of day range
    """set up the time of day filter for mongodb query
    For the database part, need convert the time of string to second

    :param webinput: dictionary, related keys timeofday_range
    :returns: dictionary, mongodb filter dictionary
    """
    if not webinput.has_key('timeofday_range'):
        return {}
    tmp_dic = {}

    start_second = int(webinput['timeofday_range'][0])
    if start_second >= 0:
        tmp_dic['n_time'] ={ '$gte':start_second }

    end_second = int(webinput['timeofday_range'][1])
    if end_second >=0:
        tmp_dic['n_time'] ={ '$lte':end_second }

    return tmp_dic


def af_driver_age(webinput):
    """set up the driver age filter for mongodb query
    consolidate the corresponding drivers sex assuming vehno = 1

    :param webinput: dictionary, related keys driver_age_range, [min_age, max_age]
    :returns: dictionary, mongodb filter dictionary
    """
    if not webinput.has_key('driver_age_range'):
        return {}
    min_age, max_age = webinput['driver_age_range']
    if min_age < 0 and max_age < 0:
        return {}
    cond_dic = {}
    if min_age >= 0:
        cond_dic['$gte'] = min_age
    if max_age >=0:
        cond_dic['$lte'] = max_age
    tmp_dic = {'drv_age':cond_dic}
    return tmp_dic

def af_driver_sex(webinput):
    """set up the driver sex filter for mongodb query
    consolidate the corresponding drivers sex assuming vehno = 1

    :param webinput: dictionary, related keys driver_sex, male | female | both
    """
    if not webinput.has_key('driver_sex'):
        return {}
    if webinput['driver_sex'] == 'male':
        return {'drv_sex': 1}
    if webinput['driver_sex'] == 'female':
        return {'drv_sex': 2}
    if webinput['driver_sex'] == 'both':
        return {'drv_sex': {'$in':[1,2]}}

def af_severity(webinput):
    """set up the severity filter for mongodb query

    :param webinput: dictionary, related keys severity, a list with candidate ['k','a','b','c']
    :returns: dictionary, mongodb filter dictionary
    """
    if not webinput.has_key('severity'):
        return {}

    if len(webinput['severity']) == 0:
        return {}
    elif len(webinput['severity']) == 1:
        return { 'num_'+webinput['severity'][0]: {'$gt':0} }
    else:
        severity_list = []
        for s in webinput['severity']:
            severity_list.append(
                { 'num_'+webinput['severity'][0]: {'$gt':0} })
        return {'$or':severity_list}

def af_loc_type(webinput):
    """set up the location type filter for mongodb query

    Base on the documentation,
    http://www.hsisinfo.org/guidebooks/north_carolina.cfm

    intersection: 6, 7, 8, 9, 12, 27
    normal segment: 0
    both: all above

    :param webinput: dictionary, related keys loc_type,
        'intersection' | 'segment' | 'both'
    :returns: dictionary, mongodb filter dictionary
    """
    if not webinput.has_key('loc_type'):
        return {}
    intersection_code_list = [6,7,8,9,12,27]
    both_code_list = copy.copy(intersection_code_list)
    both_code_list.append(0)
    if webinput['loc_type'] == 'intersection':
        return { 'loc_type': { '$in':intersection_code_list } }
    if webinput['loc_type'] == 'segment':
        return { 'loc_type': 0 }
    if webinput['loc_type'] == 'both':
        return { 'loc_type': { '$in':both_code_list } }

def af_lane_number(webinput):
    """set up the lane number filter for mongodb query

    :param webinput: dictionary, related keys no_of_lanes , list of integers
    :returns: dictionary, mongodb filter dictionary
    """
    if not webinput.has_key('no_of_lanes'):
        return {}
    if len(webinput['no_of_lanes']) == 0:
        return {}
    raise Exception("TODO")

def accident_filter(webinput):
    final_dict = {}
    filter_list = [af_bound, af_collision_type,
            af_date_range, af_tod_range,af_driver_age,
            af_driver_sex, af_severity, af_loc_type]
    for af in filter_list:
        tmpdic = af(webinput)
        final_dict.update( tmpdic )
    return final_dict

"""
Segment filtering part
"""
def sf_collision_type(webinput):
    # will only affect the data consolidation
    pass


if __name__ == "__main__":
    pass
