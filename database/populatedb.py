import sys
sys.path.append('..')
from consts import MG_HOST, MG_PORT

from pymongo import MongoClient
client = MongoClient(MG_HOST, MG_PORT)
db = client.tti
acc_col = db.accident
veh_col = db.vehicle
rtn_col = db.route # for all years
rtn_col2 = db.route2 # for year 09 only

from sas7bdat import SAS7BDAT

hsis_data_folder = "../TTI/data/HSIS" # need to adjust by yourself
import numpy as np

def populate():
    """This function will import the raw data as it is.
    """
    ylist = ['09','10','11','12','13']
    nlist = ['acc', 'veh', 'road']
    col_list = [acc_col, veh_col, rtn_col]

    for ttttt,y in enumerate(ylist):
        for i,name in enumerate(nlist):
            f = SAS7BDAT('%s/NC/nc%s%s.sas7bdat'%(hsis_data_folder,y,name))
            df = f.to_data_frame()

            print y,name, df.columns
            rn,cn = df.shape
            for j in range(rn):
                tmp_dict = df.iloc[[j]].to_dict()
                res_dict = {k: tmp_dict[k].values()[0] for k in tmp_dict.keys()}
                #print res_dict
                col_list[i].insert( res_dict )

def populate_road_09():
    """This function will only import the road data in year 2009.
    This is to avoid the duplication issues in current stage.

    However, in later stage, in order to enable before-after study,
    we need to maintain the road in different years,
    and also keep track of the changes.
    """
    ylist = ['09']
    nlist = ['road']
    col_list = [rtn_col2]

    for ttttt,y in enumerate(ylist):
        for i,name in enumerate(nlist):
            f = SAS7BDAT('%s/NC/nc%s%s.sas7bdat'%(hsis_data_folder,y,name))
            df = f.to_data_frame()

            print y,name, df.columns
            rn,cn = df.shape
            for j in range(rn):
                tmp_dict = df.iloc[[j]].to_dict()
                res_dict = {k: tmp_dict[k].values()[0] for k in tmp_dict.keys()}
                #print res_dict
                col_list[i].insert( res_dict )

if __name__ == '__main__':
    #populate()
    populate_road_09()
