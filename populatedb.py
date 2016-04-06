from pymongo import MongoClient
client = MongoClient('128.194.140.206', 27017)
db = client.tti
acc_col = db.accident
veh_col = db.vehicle
rtn_col = db.route

from sas7bdat import SAS7BDAT

hsis_data_folder = "../TTI/data/HSIS"
import numpy as np

def populate():
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

if __name__ == '__main__':
    populate()
