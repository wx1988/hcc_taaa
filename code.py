import web,json
import simplejson


from hsis_codebook import *
from db_api import get_acc_info_by_caseno, get_acc_raw_by_caseno
from db_api import check_link_exists, create_new_link, get_link_id
from db_api import get_accidents_by_bound, get_segs_by_bound
from user import get_cur_user_id
from key_encode_decode import encode_acc_info

from user import get_user_info

urls = (
    '/annotate', 'annotate_page',
    '/view_accident', 'view_accident',
    '/view_accident_raw', 'view_accident_raw',

    # demo page
    '/heatmapdemo', 'heatmapdemo',
    '/markerdemo', 'markerdemo',
    '/roaddemo', 'roaddemo',

    # restful api part
    '/get_accidents', 'get_accidents',
    '/get_roads', 'get_roads',
    '/get_segs', 'get_segs',
    '/get_faceted_info', 'get_faceted_info',

    # user management
    '/get_user_info', 'get_user_info'
    )

# demo pages
class heatmapdemo:
    def GET(self):
        render = web.template.render('templates/')
        return render.heatmap_demo()

class markerdemo:
    def GET(self):
        render = web.template.render('templates/')
        return render.marker_demo()

class roaddemo:
    def GET(self):
        render = web.template.render('templates/')
        return render.segs_demo()


# other
class annotate_page:
    def GET(self):
        render = web.template.render('templates/')
        return render.annotation()

# debug page
class view_accident:
    def GET(self):
        d = web.input()
        caseno = int(d['caseno'])
        data = get_acc_raw_by_caseno(caseno)

        res = {
            'status':0,
            'data':data}
        #return json.dumps(data, indent=2)
        return simplejson.dumps(res, ignore_nan=True, indent=4 * ' ')

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
        return simplejson.dumps(res, ignore_nan=True, indent=4 * ' ')
        # This ignore_nan function is not enabled in the default json package

    def POST(self):
        return self.GET()


###
# API, build the annotation between factors within one accident
###
class get_accidents:
    def GET(self):
        d = web.input()
        # first is the boundary type
        if d['filtertype'] == 'bound':
            bound = {
                    'left':d['left'],
                    'right':d['right'],
                    'top':d['top'],
                    'down':d['down']}
            data = get_accidents_by_bound( bound )
            #return simplejson.dumps(res, )
            return simplejson.dumps({
                'status':0,
                'data':data},
                ignore_nan=True)
        else:
            return simplejson.dumps({
                'status':1,
                'data':'Unknown filter type'})

    def POST(self):
        return self.GET()

class get_segs:
    def GET(self):
        d = web.input()
        if d['filtertype'] == 'bound':
            bound = {
                    'left':float(d['left']),
                    'right':float(d['right']),
                    'top':float(d['top']),
                    'down':float(d['down'])}
            data = get_segs_by_bound(bound)
            print "number of segs", len(data)
            return simplejson.dumps({
                'status':0,
                'data':data},
                ignore_nan=True)
        else:
            return simplejson.dumps({
                'status':1,
                'data':'Unknown filter type'},
                ignore_nan=True)

    def POST(self):
        return self.GET()

class get_faceted_info:
    def GET(self):
        from hsis_codebook import event as event_dict
        from hsis_codebook import rdsurf as rdsurf_dict
        from hsis_codebook import loc_type as loc_type_dict

        d = web.input()
        res = {}
        if d['type'] == "collision":
            # collision type
            res = event_dict

        if d['type'] == "roadsurf":
            res = rdsurf_dict

        if d['type'] == "loc_type":
            res = loc_type_dict

        return simplejson.dumps({
            'status':0,
            'data': res })

    def POST(self):
        return self.GET()

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
