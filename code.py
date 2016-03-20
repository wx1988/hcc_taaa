import web,json
import simplejson


from hsis_codebook import *
from db_api import get_acc_info_by_caseno
from db_api import check_link_exists, create_new_link
from user import get_cur_user_id
from key_encode_decode import encode_acc_info


urls = (
    '/annotate', 'annotate_page',
    '/view_accident', 'view_accident',
    '/view_accident_raw', 'view_accident_raw',

    # restful api part
    '/add_causal_link', 'add_causal_link',
    '/get_nodes', 'get_nodes'
    )

class annotate_page:
    def GET(self):
        render = web.template.render('templates/')
        return render.annotation()


class view_accident:
    def GET(self):
        pass


class view_accident_raw:
    def GET(self):
        d = web.input()
        caseno = int(d['caseno'])
        data = get_acc_info_by_caseno(caseno)
        if data == None:
            return "Not found"
        data = encode_acc_info(data)

        res = {
            'status':0,
            'data':data}
        #return json.dumps(data, indent=2)
        return simplejson.dumps(res, ignore_nan=True)
        # This ignore_nan function is not enabled in the default json package

    def POST(self):
        return self.GET()

###
# API, build the annotation between factors within one accident
###
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

class add_causal_link:
    """
    Test URL
    http://rtds9.cse.tamu.edu:8099/add_causal_link?caseno=102484009&from_node=acc|weather1&to_node=acc|rdsurf&node_type=cause
    Test Done
    """
    def GET(self):
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
        if not check_exist:
            # update the causal graph
            create_new_link(casual_link_info)
            return json.dumps( { 'status':0 } )
        else:
            return json.dumps( { 'status':1 } )

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
