
"""
Prepare the filter from the user request to the mongodb filtering
"""
import copy
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
                '$lt':float(webinput['up'])},
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
    tmp_dic = {'events':{'$in':collision_list}}}
    return tmp_dic

def af_date_range(webinput):
    """set up the date range filter for mongodb query
    check whether there is intersection with events field

    TODO, for the database part, need convert the date string to date object

    :param webinput: dictionary, related keys date_range
    :returns: dictionary, mongodb filter dictionary
    """

    pass

def af_tod_range(webinput):
    # time of day range
    """set up the time of day filter for mongodb query
    TODO, for the database part, need convert the time of string to second

    :param webinput: dictionary, related keys timeofday_range
    :returns: dictionary, mongodb filter dictionary
    """

    pass


def af_driver_age(webinput):
    """set up the time of day filter for mongodb query
    TODO, consolidate the corresponding drivers sex assuming vehno = 1

    :param webinput: dictionary, related keys driver_age_range, [min_age, max_age]
    :returns: dictionary, mongodb filter dictionary
    """

    pass

def af_driver_sex(webinput):
    """

    TODO, consolidate the corresponding drivers sex assuming vehno = 1
    male | female | both
    """
    pass

def af_severity(webinput):
    """set up the severity filter for mongodb query

    :param webinput: dictionary, related keys severity, a list with candidate ['k','a','b','c']
    :returns: dictionary, mongodb filter dictionary
    """
    if not webinput.has_key('severity'):
        return {}
    if len(webinput['severity']) == 1:
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
    intersection_code_list = [6,7,8,,9,12,27]
    both_code_list = copy.copy(intersection_code_list)
    both_code_list.append(0)
    if webinput['loc_type'] == 'intersection':
        return { 'loc_type': { '$in':intersection_code_list } }
    if webinput['loc_type'] == 'segment':
        return { 'loc_type': 0 }
    if webinput['loc_type'] == 'both':
        return { 'loc_type': { '$in':both_code_list } }

def accident_filter(webinput):
    final_dict = {}
    filter_list = [af_bound, af_collision_type,
            af_date_range, af_tod_range,af_driver_age,
            af_driver_sex, af_severity, af_loc_type]
    for af in filter_list:
        tmpdic = af(webinput)
        final_dict.update( tmpdic )
    return filter_list

"""
Segment filtering part
"""
def sf_collision_type(webinput):
    # will only affect the data consolidation
    pass


if __name__ == "__main__":
    pass
