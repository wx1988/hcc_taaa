#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
This file provide the web interface, RESTful API
"""

import web,json
import simplejson

from hsis_codebook import *
from db_api import get_acc_info_by_caseno, get_acc_raw_by_caseno
from db_api import check_link_exists, create_new_link, get_link_id
from db_api import get_accidents_api, get_segs_by_bound
from user import get_cur_user_id
from key_encode_decode import encode_acc_info

from user import get_user_info

urls = (
    # GUI
    '/', 'index',

    # restful api part
    '/get_accidents', 'get_accidents',
    '/get_segs', 'get_segs',
    '/add_log', 'add_log',

    # others, causal annotation
    '/annotate', 'annotate_page',
    '/get_user_info', 'get_user_info'

    # other, demo and debug
    '/heatmapdemo', 'heatmapdemo',
    '/roaddemo', 'roaddemo',
    '/view_accident', 'view_accident',
    '/view_accident_raw', 'view_accident_raw',
    '/get_faceted_info', 'get_faceted_info',
    )


class index:
    """This page is the main user interface
    """
    def GET(self):
        render = web.template.render('templates/')
        return render.index()

###
# API, build the annotation between factors within one accident
###
class get_accidents:
    def GET(self):
        d = web.input()
        print d
        facet_obj = json.loads(d['facetObj'])
        for p in ['down','right', 'top','left']:
            facet_obj[p] = d[p]

        print facet_obj
        # first is the boundary type
        data = get_accidents_api(facet_obj)
        print 'accident number', len(data)
        #return simplejson.dumps(res, )
        return simplejson.dumps({
            'status':0,
            'data':data},
            ignore_nan=True)

    def POST(self):
        return self.GET()

class add_log:
    def GET(self):
        from db_api import create_log
        d = web.input()
        log_info = {
            "user_id" : get_cur_user_id(self),
            "action" : d['action'],
            "timestamp" : d['timestamp']
        }
        create_log(log_info)
        return 0

    def POST(self):
        return self.GET()

class get_segs:
    def GET(self):
        d = web.input()

        bound = {
                'left':float(d['left']),
                'right':float(d['right']),
                'top':float(d['top']),
                'down':float(d['down'])}

        # TODO, filter the related accident based on
        # the actual retrieved events.
        data = get_segs_by_bound(bound)
        print "number of segs", len(data)
        return simplejson.dumps({
            'status':0,
            'data':data},
            ignore_nan=True)

    def POST(self):
        return self.GET()

###
# non useful pages and services.
###
class heatmapdemo:
    """ demo page about how to write heatmap
    """
    def GET(self):
        render = web.template.render('templates/')
        return render.heatmap_demo()

class roaddemo:
    """ demo page about how to show ployline
    """
    def GET(self):
        render = web.template.render('templates/')
        return render.segs_demo()

class annotate_page:
    """ annotate causal relation
    """
    def GET(self):
        render = web.template.render('templates/')
        return render.annotation()

class view_accident:
    """ view detail of accident
    """
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
    """ view detail of raw accident
    """
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
