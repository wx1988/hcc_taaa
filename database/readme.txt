This submodule is in charge of database maintance.

# Data set introduction
Currently, our system only support North Carolina. Two relevant dataset are retrieved:
* the accident dataset (including accident, vehicles, and road features), which is requested from Highway Safety Information System (HSIS).  http://www.hsisinfo.org/guidebooks/north_carolina.cfm
* the Linear Reference System (LRS) for all the road segment in ArcGIS shapefile format. Which is public avaiable at, https://connect.ncdot.gov/resources/gis/pages/gis-data-layers.aspx

Data from state supported by HSIS could be easily imported. However, the LRS is not public avaiable for each state.

# Data Import
`populate_db.py` will import the accident information in to MongoDB. However, only road of year 2009 is imported in current stage. In order to support road information of multiple years, more design is needed.

As for the LRS, it is imported into the postgresql with postGIS support. The data is firstly converted to WGS_GCS_1984 world reference system coordinate, i.e. latitude/longitude. Then the following `shp2pgsql` is use to import it into the database.


# Data Normalization and consolidation
We conduct several pre-processing to the dataset.
* matching the accident road segment to the LRS to get the actual latitude and longitude location.
*
