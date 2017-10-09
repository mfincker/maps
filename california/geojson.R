# Create GeoJSON files with population data for state: counties,
# county subdivisions, and census tracts.

# Author: Bill Behrman
# Version: 2017-10-09

# Libraries
library(tidyverse)
library(sf)
library(stringr)

# Parameters
  # ACS Year
ACS_YEAR <- "2015"
  # Boundaries year
BOUNDARIES_YEAR <- "2016"
  # State FIPS
STATE_FIPS <- "06"  # California
  # EPSG code for WGS84 coordinate reference system
epsg_wgs84 <- 4326L
  # Base API query for ACS 5-year population estimates
api_base <- str_c("https://api.census.gov/data/", ACS_YEAR, "/acs5?get=GEOID,NAME,B03001_001E,B03002_003E,B03001_003E,B03002_006E,B03002_004E")
  # API queries for ACS 5-year population estimates
api_query <- c(
  county             = str_c(api_base, "&for=county:*&in=state:", STATE_FIPS),
  county_subdivision = str_c(api_base, "&for=county+subdivision:*&in=state:", STATE_FIPS),
  tract              = str_c(api_base, "&for=tract:*&in=state:", STATE_FIPS)
)
  # URLs for US Census Bureau boundary shape files
url_boundaries <-  c(
  county             = str_c("https://www2.census.gov/geo/tiger/GENZ", BOUNDARIES_YEAR, "/shp/cb_", BOUNDARIES_YEAR, "_us_county_500k.zip"),
  county_subdivision = str_c("https://www2.census.gov/geo/tiger/GENZ", BOUNDARIES_YEAR, "/shp/cb_", BOUNDARIES_YEAR, "_", STATE_FIPS, "_cousub_500k.zip"),
  tract              = str_c("https://www2.census.gov/geo/tiger/GENZ", BOUNDARIES_YEAR, "/shp/cb_", BOUNDARIES_YEAR, "_", STATE_FIPS, "_tract_500k.zip")
)
  # Variable names for region codes in US Census Bureau boundary shape files
var_region_code <- c(
  county             = quo(countyfp),
  county_subdivision = quo(cousubfp),
  tract              = quo(tractce)
)
  # Temp directory
dir_tmp <- "data/tmp/"
  # Output files
files_out <- c(
  county             = "data/county.geojson",
  county_subdivision = "data/county_subdivision.geojson",
  tract              = "data/tract.geojson"
)

#===============================================================================

# Get ACS population estimates
get_population <- function(region) {
  v <- jsonlite::fromJSON(api_query[region])
  colnames(v) <- v[1, ]
  v <- 
    v %>% 
    .[-1, ] %>% 
    as_tibble() %>% 
    mutate(NAME = str_replace(NAME, ", \\w+$", "")) %>% 
    mutate_at(vars(starts_with("B03")), as.integer) %>% 
    rename(
      geoid             = GEOID,
      name              = NAME,
      total             = B03001_001E,
      white_nonhispanic = B03002_003E,
      hispanic          = B03001_003E,
      asian_nonhispanic = B03002_006E,
      black_nonhispanic = B03002_004E
    )
  if (region == "county_subdivision") {
    v <- 
      v %>% 
      mutate(name = str_replace(name, "[ ]+CCD[ ]*,", ",")) %>% 
      rename(county_subdivision = `county subdivision`)
  }
  v
}

# Get US Census Bureau boundaries
get_boundaries <- function(region) {
  
  # Download and unzip US Census Bureau shapefile
  url <- url_boundaries[region]
  dest <- str_c(dir_tmp, region, ".zip")
  if (download.file(url = url, destfile = dest, quiet = TRUE)) {
    stop(str_c("Error: Download for ", region, " failed"))
  }
  unzip(zipfile = dest, exdir = str_c(dir_tmp, region))
  
  # Read shapefile into sf object, filter to state, and convert to WGS84 
  # coordinate reference system
  st_read(dsn = str_c(dir_tmp, region), stringsAsFactors = FALSE) %>%
    rename_all(tolower) %>% 
    filter(statefp == STATE_FIPS) %>% 
    arrange(geoid) %>% 
    st_transform(crs = epsg_wgs84)
}

# Create temp directory
if (!file.exists(dir_tmp)) {
  dir.create(dir_tmp, recursive = TRUE)
}

# Create and write out GeoJSON files for each region
for (region in names(files_out)) {
  get_boundaries(region) %>% 
    mutate(affgeoid = str_replace(affgeoid, "00US", "US")) %>% 
    select(-name) %>% 
    left_join(get_population(region), by = c("affgeoid" = "geoid")) %>% 
    select(
      statefp:(!!(var_region_code[[region]])),
      geoid,
      name:black_nonhispanic,
      aland,
      awater
    ) %>% 
    st_write(dsn = files_out[[region]])
}

# Remove temporary directory
if (unlink(dir_tmp, recursive = TRUE, force = TRUE)) {
  print("Error: Remove temporary directory failed")
}
  