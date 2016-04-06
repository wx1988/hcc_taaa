import psycopg2


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

    sql = "select as_text(geom) from ncdot84 where cnty_rte = '%s'"%(new_rid)
    pass


def acc2latlng():
    """
    TODO, first get the linestring, then use projection methods
    """
    pass
