import web,json

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
#https://api.mongodb.org/python/current/examples/authentication.html
#client = MongoClient('mongodb://hcc:tti@54.201.125.48')
#client = MongoClient('mongodb://hcc:tti@54.201.125.48:27117')
#client = MongoClient('54.201.125.48', 27117)
db = client.tti
acc_col = db.accident
veh_col = db.vehicle

from hsis_codebook import *

urls = (
    '/view_accident', 'view_accident',
    '/view_accident_raw', 'view_accident_raw'
    )

class view_accident:
    def GET(self):
        pass

class view_accident_raw:
    def GET(self):
        d = web.input()
        caseno = int(d['caseno'])

        data = {}
        acc = acc_col.find_one( {'caseno':caseno} )
        if not acc:
            return "Not found"
        del acc['_id']
        data['acc'] = replace_acc_coding(acc)

        veh_cur = veh_col.find({'caseno':caseno})
        veh_list = []
        for veh in veh_cur:
            del veh['_id']
            veh = replace_veh_coding(veh)
            veh_list.append(veh)
        data['veh_list'] = veh_list

        return json.dumps(data, indent=2)

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
