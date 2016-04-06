import psycopg2


PG_HOST = "128.194.140.229"
PG_DB = "hpms"

###########
# Consolidate with the LRS system
###########
def cnty_rte2linestring(rid):
    """
    TODO, execute postgresql
    """
    # first reformat the rid
    # move the first two id to the end
    # 2530000024 -> 3000002425
    new_rid = rid
    conn = psycopg2.connect("dbname='%s' user='xingwang' host='%s' password='xingwang'"%(PG_DB, PG_HOST))
    sql = "select st_astext(geom) from ncdot84 where rte_id = '%s'"%(new_rid)
    cur = conn.cursor()
    cur.execute(sql)
    rows = cur.fetchall()
    for row in rows:
        print row

def acc2latlng():
    """
    TODO, first get the linestring, then use projection methods
    """
    pass


if __name__ == "__main__":
    rid = '1000007759'
    cnty_rte2linestring(rid)
