"""
This is used to code and decode the item in the json file
"""

def gen_svg_graph(encode_nodes, links):
    """
    create svg graph
    """
    pass
    

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
    	package1['attributes'].append({
    		'key' : 'acc|%s'%(k),
    		'value' : acc_info['acc'][k]
    		})
    package_list.append(package1)

    # part 2, the vehicle part
    for veh in acc_info['veh_list']:
    	tmp_package = {}
    	tmp_package['type'] = 'vehicle'
    	tmp_package['attributes'] = []
    	for k in veh.keys():
    		tmp_package['attributes'].append({
    			'key' : 'vehicle|%d|%s'%(veh['vehno'], k), 
    			'value' : veh[k]
    			})
    	package_list.append( tmp_package )

    return package_list


def decode_acc(encodon):
	pass