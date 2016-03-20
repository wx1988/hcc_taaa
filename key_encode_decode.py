"""
This is used to code and decode the item in the json file
"""

import numpy as np

def encode_acc_info(acc_info):
    """
    generate key for each elements

    create a few packages,
    for each package, encode as key, value format

    """
    package_list = []

    # part 1, the acc part
    package1 = {}
    package1['type'] = 'environmental'
    package1['attributes'] = []
    for k in acc_info['acc'].keys():
        #print type(acc_info['acc'][k]),acc_info['acc'][k]
        #if np.isnan(acc_info['acc'][k]):
        #    continue

        package1['attributes'].append({
            'key' : 'acc %s'%(k),
            'value' : acc_info['acc'][k]
            })
    package_list.append(package1)

    # part 2, the vehicle part
    for veh in acc_info['veh_list']:
        tmp_package = {}
        tmp_package['type'] = 'vehicle'
        tmp_package['index'] = int(veh['vehno'])
        tmp_package['attributes'] = []
        for k in veh.keys():
            #print type(veh[k]),veh[k]
            tmp_package['attributes'].append({
                'key' : 'vehicle %d %s'%(veh['vehno'], k),
                'value' : veh[k]
                })
        package_list.append( tmp_package )

    return package_list


def decode_acc(encodon):
    pass
