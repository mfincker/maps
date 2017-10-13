# Create and upload Mapbox tiles for California population map
# 
# Usage:
# % make              # Create Mapbox tiles
# % make install      # Upload Mapbox tiles
# % make clean        # Remove GeoJSON files and Mapbox tiles

# Author: Bill Behrman
# Version: 2017-10-12

mbtiles: county.mbtiles county_subdivision.mbtiles tract.mbtiles

county.mbtiles: county.geojson Makefile
	tippecanoe -o $@ -f -z 9 -Z 4 -l $(basename $@) $<

county_subdivision.mbtiles: county_subdivision.geojson Makefile
	tippecanoe -o $@ -f -z 11 -Z 8 -l $(basename $@) $<

tract.mbtiles: tract.geojson Makefile
	tippecanoe -o $@ -f -Z 10 -l $(basename $@) $<

geojson: county.geojson county_subdivision.geojson tract.geojson

county.geojson county_subdivision.geojson tract.geojson: geojson.R
	Rscript geojson.R

clean:
	rm -f *.geojson *.mbtiles
