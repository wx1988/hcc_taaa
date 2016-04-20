"""
Prepare the filter from the user request to the mongodb filtering
"""

"""
Accident filtering part
"""
def af_bound(webinput):
    tmpdic = {
            'lat':{
                '$gt':float(webinput['down']),
                '$lt':float(webinput['up'])},
            'lng':{
                '$gt':float(webinput['left']),
                '$lt':float(webinput['right'])
                }
            }
    return tmpdic

def af_collision_type(webinput):
    pass


def af_date_range(webinput):
    pass


def af_tod_range(webinput):
    # time of day range
    pass

def af_driver_age(webinput):
    """
    [min_age, max_age]
    """
    pass

def af_driver_sex(webinput):
    """
    male or female
    """
    pass

def af_severity(webinput):
    """
    a list with candidate ['k','a','b','c']
    """
    pass

def af_loc_type(webinput):
    """
    intersection, non-intersection
    """
    pass

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
