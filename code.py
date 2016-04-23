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
from user import get_next_uid

urls = (
    # GUI
    '/', 'index',

    # restful api part
    '/get_accidents', 'get_accidents',
    '/get_segs', 'get_segs',
    '/add_log', 'add_log',
    '/get_user_info', 'get_user_info',

    # others, causal annotation
    '/annotate', 'annotate_page',

    # other, demo and debug
    '/heatmapdemo', 'heatmapdemo',
    '/roaddemo', 'roaddemo',
    )

web.config.debug = False
app = web.application(urls, globals())
session = web.session.Session(app, web.session.DiskStore('sessions'))

# user part
def get_current_user_id():
    session_uid = session.get('user_id')
    if session_uid:
        return session_uid
    else:
        # find the maximal user id and plus one
        next_id = get_next_uid()
        session.user_id = next_id
        return next_id

class get_user_info:
    def GET(self):
        cur_id = get_current_user_id()
        return json.dumps({
            'status':0,
            'data':{'user_id':cur_id}
            })

    def POST(self):
        return self.GET()

class index:
    """This page is the main user interface
    """
    def GET(self):
        cur_id = get_current_user_id()
        print "current user id", cur_id
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
            "user_id" : get_current_user_id(),
            "action" : d['action'],
            "timestamp" : d['timestamp']
        }
        create_log(log_info)
        return json.dumps({'status':0})

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

if __name__ == "__main__":
    app.run()

