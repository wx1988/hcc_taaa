import pickle
from pymongo import MongoClient
client = MongoClient('localhost', 27017)

db = client.tti
acc_col = db.accident
veh_col = db.vehicle

###########
# identify a region of interest for light weight prototype
###########

def group_case_by_cnty_rte():
    seg2caselist = {}
    for acc in acc_col.find():
        if not seg2caselist.has_key( acc['cnty_rte'] ):
            seg2caselist[acc['cnty_rte']] = []
        seg2caselist[acc['cnty_rte']].append( acc['caseno'] )

    seg_list = seg2caselist.keys()
    seg_list = sorted( seg_list, key=lambda s: len(seg2caselist[s]) )
    res = {
        'sorted_seg_list': seg_list, 
        'seg2caselist': seg2caselist
    }
    with open('seginfo.pkl','w') as f:
        pickle.dump( res, f)

def show_info():
    seginfo = pickle.load(open('seginfo.pkl','r'))

    sorted_seg_list = seginfo['sorted_seg_list']
    seg2caselist = seginfo['seg2caselist']

    for i in range(10):
        segid = sorted_seg_list[-1*i-1]
        print segid , len( seg2caselist[segid] )




if __name__ == "__main__":
    #group_case_by_cnty_rte()
    show_info()
