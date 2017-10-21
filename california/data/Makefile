# Create Mapbox tiles for California population map
# 
# Usage:
# % make              # Create Mapbox tiles
# % make clean        # Remove GeoJSON files and Mapbox tiles

# Author: Bill Behrman
# Version: 2017-10-20

GEOJSONS = ca-county.geojson ca-county-subdivision.geojson ca-tract.geojson

MBTILES  = ca-county.mbtiles ca-county-subdivision.mbtiles ca-tract.mbtiles

mbtiles: $(MBTILES)

ca-county.mbtiles: ca-county.geojson Makefile
	tippecanoe -o $@ -f -z 9 -Z 4 -l county $<

ca-county-subdivision.mbtiles: ca-county-subdivision.geojson Makefile
	tippecanoe -o $@ -f -z 11 -Z 8 -l county-subdivision $<

ca-tract.mbtiles: ca-tract.geojson Makefile
	tippecanoe -o $@ -f -Z 10 -l tract $<

geojson: $(GEOJSONS)

$(GEOJSONS): geojson.R
	Rscript geojson.R

clean:
	rm -f ./*.geojson ./*.mbtiles
