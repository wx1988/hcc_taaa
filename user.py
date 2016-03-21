"""
User management
"""
import json

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
