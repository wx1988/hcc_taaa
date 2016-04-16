class get_nodes:
    def GET(self):
        d = web.input()
        caseno = int(d['caseno'])
        data = get_acc_info_by_caseno(caseno)
        if data == None:
            return "Not found"
        data = encode_acc_info(data)
        #return json.dumps(data, indent=2)
        return data

class get_links:
    def GET(self):
        from db_api import get_links_by_case_user
        d = web.input()
        caseno = int(d['caseno'])
        user_id = get_cur_user_id(self)
        links = get_links_by_case_user(caseno, user_id)
        res_dic = {'status':0, 'data':links}
        return json.dumps(res_dic)

    def POST(self):
        return self.GET()

class add_causal_link:
    """
    Test URL
    http://rtds9.cse.tamu.edu:8099/add_causal_link?caseno=102484009&from_node=acc|weather1&to_node=acc|rdsurf&node_type=cause
    Test Done
    """
    def GET(self):
        from db_api import update_graph
        d = web.input()
        # get current user id
        casual_link_info = {
            "caseno" : int( d['caseno'] ),
            "from_node" :  d['from_node'],
            "to_node" : d['to_node'],
            "node_type" :  d['node_type'],
            "user_id" : get_cur_user_id(self)
        }

        # add the link to database

        # first check whether there exist such a causal link
        check_exist = check_link_exists(casual_link_info)
        res_dic = {}
        if not check_exist:
            # update the causal graph
            create_new_link(casual_link_info)
            res_dic = { 'status':0 }
        else:
            res_dic = { 'status':1 }
        res_dic['data'] = {'linkid':get_link_id(casual_link_info)}
        # graph changed
        update_graph(
            int( d['caseno'] ), get_cur_user_id(self) )
        return json.dumps(res_dic)

    def POST(self):
        return self.GET()


