"""
Import additional features:
    accident: alcflag
    road: terrain
    vehicle: alcflag, num_k, num_a, num_b, num_c, vision
"""
from pymongo import MongoClient
client = MongoClient('128.194.140.206', 27017)
db = client.tti
acc_col = db.accident
veh_col = db.vehicle
rtn_col = db.route2

from sas7bdat import SAS7BDAT

ylist = ['09','10','11','12','13']
hsis_data_folder = "../../TTI/data/HSIS"

def update_acc():
    name = 'acc'
    for y in ylist:
        f = SAS7BDAT('%s/NC/nc%s%s.sas7bdat'%(hsis_data_folder,y,name))
        df = f.to_data_frame()
        caseno_list = df['caseno']
        alc_list = df['alcflag']
        print len(caseno_list), len(alc_list)
        print caseno_list[0], type(caseno_list[0])
        print alc_list[0], type(alc_list[0])
        for i in range(len(caseno_list)):
            acc_col.update(
                {'caseno':caseno_list[i]},
                {'$set':{'alcflag':alc_list[i]}}
                )
            
def update_acc2():
    name = 'acc'
    for y in ylist:
        f = SAS7BDAT('%s/NC/nc%s%s.sas7bdat'%(hsis_data_folder,y,name))
        df = f.to_data_frame()
        caseno_list = df['caseno']
        nbrlane_list = df['nbr_lane']
        loctype_list = df['loc_type']
        print len(caseno_list)
        print caseno_list[0], type(caseno_list[0])
        for i in range(len(caseno_list)):
            acc_col.update(
                {'caseno':caseno_list[i]},
                {'$set':{
                    'nbr_lane':nbrlane_list[i],
                    'loc_type':loctype_list[i]
                    }}
                )

def update_road():
    print 'update road'
    y = '09'
    name = 'road'
    f = SAS7BDAT('%s/NC/nc%s%s.sas7bdat'%(hsis_data_folder,y,name))
    df = f.to_data_frame()
    cnty_rte_list = df['cntyrte']
    begmp_list = df['begmp']
    terrain_list = df['terrain']

    for i in range(len(terrain_list)):
        rtn_col.update(
                {'cntyrte': cnty_rte_list[i], 'begmp':begmp_list[i]},
                {'$set':{'terrain':terrain_list[i]}}
            )

def update_vehicle():
    print 'update vehicle'
    name = 'veh'
    field_list = ['alcflag','vision','num_k','num_a','num_b','num_c']
    for y in ylist:
        f = SAS7BDAT('%s/NC/nc%s%s.sas7bdat'%(hsis_data_folder,y,name))
        df = f.to_data_frame()
        caseno_list = df['caseno']
        vehno_list = df['vehno']
        data_list_list = []
        for field in field_list:
            data_list_list.append( df[field] )
        for i in range(len(caseno_list)):
            filter_dict = {'caseno':caseno_list[i], 'vehno':vehno_list[i]}
            update_dict = {}
            for j in range( len(field_list)):
                update_dict[field_list[j]] = data_list_list[j][i]
            veh_col.update( filter_dict, {'$set':update_dict} )


def consolidate_injury():
    # get all caseno
    # find all vehicle, get the number and consolidate 
    pass


if __name__ == "__main__":
    #update_acc()
    update_acc2()
    #update_road()
    #update_vehicle()
