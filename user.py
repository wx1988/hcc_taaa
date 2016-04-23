"""
User management
"""
import json
from consts import MG_HOST, MG_PORT

import pymongo
from pymongo import MongoClient

client = MongoClient(MG_HOST, MG_PORT)
db = client.tti
log_col = db.log

class get_user_info:
    def GET(self):
        uid=get_cur_user_id(self)
        res = {'status':0, 'data':{'id':uid}}
        return json.dumps( res )
    def POST(self):
        return self.GET()

def get_cur_user_id(webinfo):
    """
    Assuming only one user now
    """
    return 1

def get_next_uid():
    """Get the next avaiable ID to assign to a new user
    """
    latest_log = log_col.find().sort("user_id", pymongo.DESCENDING).limit(1)
    return latest_log[0]['user_id'] + 1

if __name__ == "__main__":
    print get_next_uid()
