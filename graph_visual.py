"""
"""
from key_encode_decode import encode_acc_info
from db_api import get_links, get_acc_info_by_caseno

def gen_svg_graph(encode_nodes, links, outpath=None):
    """
    create svg graph
    
    digraph G {
    subgraph cluster_1 {
        node [style=filled];
        b0 -> b1 -> b2 -> b3;
        label = "process #2";
        color=blue
    }
    """
    
    cluster_tpl = """
    subgraph cluster_%s {
        node [style=filled];
        %s
        edge[style=invis];
        %s
        label = "%s";
        color=blue;
    }"""
    cluster_list = []
    for package in encode_nodes:
        if package['type'] == 'vehicle':
            cluster_name = "%s_%d"%(package['type'], package['index'])
        else: 
            cluster_name = package['type']
        node_str = ""
        for attr in package['attributes']:
            node_str += "\"%s\";\n"%(attr['key'])
        edge_str = ""
        for i in range( len(package['attributes'])):
        	for j in range( len(package['attributes'])):
        		if i == j:
        			continue
        		edge_str += "\"%s\" -> \"%s\";\n"%(
        			package['attributes'][i]['key'],
        			package['attributes'][j]['key'])

        label = cluster_name
        cluster_list.append( cluster_tpl%(
        	cluster_name, 
        	node_str, 
        	edge_str,
        	label) )
    all_cluster_str = ""
    for cluster_str in cluster_list:
        all_cluster_str += cluster_str

    links_str = ""
    for link in links:
    	if link['node_type'] == 'cause':
    		links_str += "\"%s\" -> \"%s\";"%(link['from_node'], link['to_node'])

    final_str = "digraph G{\n%s\n%s\n}"%(all_cluster_str, links_str)
    if outpath:
        with open(outpath,'w') as f:
            print>>f,final_str
    return final_str

def test_gen_svg_graph():
    caseno = 102484009
    user_id = 1

    acc_info = get_acc_info_by_caseno(caseno)
    nodes = encode_acc_info(acc_info)

    links = get_links(caseno, user_id)
    svg_str = gen_svg_graph( nodes, links, 'tmp/t.dot' )
    

if __name__ == "__main__":
    test_gen_svg_graph()