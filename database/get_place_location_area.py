"""
County:
    NAME_LOCAS
    POP2010PRJ
    Shape_Leng
    Shape_Area
    Bound->Calcualted center

Municipal:
    MB_NAME
    POP_EST
    GEO
    Shape_Area
    Shape_Leng
    Bound

Try regex search
https://docs.mongodb.org/manual/reference/operator/query/regex/
"""
from pymongo import MongoClient
client = MongoClient('128.194.140.206', 27017)
db = client.tti
place_col = db.place

import shapefile

def collect_county():
    shp_file = "../../TTI/tmp/NCCountyBoundary84/NCCountyBoundary84"
    sf = shapefile.Reader(shp_file)
    shapes = sf.shapes()
    records = sf.records()
    print records[2]

    fields = sf.fields
    #print fields
    useful_fields = ['NAME_LOCAS', 'Shape_Leng', 'Shape_Area','POP2010PRJ']
    unify_name = ['name','len','area','population']
    useful_fields_idx = []
    for uf in useful_fields:
        for i,f in enumerate(fields):
            if f[0] == uf:
                useful_fields_idx.append(i-1)
    print useful_fields_idx

    for i in range(len(records)):
        tmpdict = {}
        for j,uf in enumerate(useful_fields):
            print len(records[i])
            tmpdict[ unify_name[j] ] = records[i][useful_fields_idx[j]]
        boundary = {
                'left':shapes[i].bbox[0],
                'down':shapes[i].bbox[1],
                'right':shapes[i].bbox[2],
                'top':shapes[i].bbox[3] }

        tmpdict['boundarybox'] = boundary
        tmpdict['center'] =[
            (boundary['left']+boundary['right'])/2,
            (boundary['top']+boundary['down'])/2 ]
        place_col.insert(tmpdict)
        #break

def collect_municipal():
    shp_file = "../../TTI/tmp/NCMunicity84/NCMunicity84"
    sf = shapefile.Reader(shp_file)
    shapes = sf.shapes()
    records = sf.records()
    print records[2]

    fields = sf.fields
    #print fields
    useful_fields = ['MB_NAME','Shape_Leng', 'Shape_Area', 'POP_EST']
    unify_name = ['name','len','area','population']
    useful_fields_idx = []
    for uf in useful_fields:
        for i,f in enumerate(fields):
            if f[0] == uf:
                useful_fields_idx.append(i-1)
    print useful_fields_idx

    for i in range(len(records)):
        tmpdict = {}
        for j,uf in enumerate(useful_fields):
            print len(records[i])
            tmpdict[ unify_name[j] ] = records[i][useful_fields_idx[j]]
        boundary = {
                'left':shapes[i].bbox[0],
                'down':shapes[i].bbox[1],
                'right':shapes[i].bbox[2],
                'top':shapes[i].bbox[3] }

        tmpdict['boundarybox'] = boundary
        tmpdict['center'] =[
            (boundary['left']+boundary['right'])/2,
            (boundary['top']+boundary['down'])/2 ]
        place_col.insert(tmpdict)
        #break


    pass


if __name__ == "__main__":
    collect_county()
    collect_municipal()
