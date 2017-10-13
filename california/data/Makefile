# Create Mapbox tiles for California population map
# 
# Usage:
# % make              # Create Mapbox tiles
# % make clean        # Remove GeoJSON files and Mapbox tiles

# Author: Bill Behrman
# Version: 2017-10-13

GEOJSONS = ca-pop-county.geojson ca-pop-county-subdivision.geojson \
  ca-pop-tract.geojson

MBTILES  = ca-pop-county.mbtiles ca-pop-county-subdivision.mbtiles \
  ca-pop-tract.mbtiles

mbtiles: $(MBTILES)

ca-pop-county.mbtiles: ca-pop-county.geojson Makefile
	tippecanoe -o $@ -f -z 9 -Z 4 -l $(basename $@) $<

ca-pop-county-subdivision.mbtiles: ca-pop-county-subdivision.geojson Makefile
	tippecanoe -o $@ -f -z 11 -Z 8 -l $(basename $@) $<

ca-pop-tract.mbtiles: ca-pop-tract.geojson Makefile
	tippecanoe -o $@ -f -Z 10 -l $(basename $@) $<

geojson: $(GEOJSONS)

$(GEOJSONS): geojson.R
	Rscript geojson.R

clean:
	rm -f ./*.geojson ./*.mbtiles
