# Create GeoJSON files with population data for state: counties,
# county subdivisions, and census tracts.

# Author: Bill Behrman
# Version: 2017-10-13

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
EPSG_WGS84 <- 4326L
  # Number of square meters in a square mile
SQ_METER_SQ_MILE <- 1609.344 ^ 2
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
  # Temp directory
dir_tmp <- "tmp/"
  # Output files
files_out <- c(
  county             = "county.geojson",
  county_subdivision = "county_subdivision.geojson",
  tract              = "tract.geojson"
)

#===============================================================================

# Group percentage of total
group_pct <- function(group, total) {
  as.integer(round(if_else(total == 0L, 0, 100 * (group / total))))
}

# Largest group
largest_group <- function(
  white_nonhispanic, hispanic, asian_nonhispanic, black_nonhispanic, other
) {
  if (all(white_nonhispanic == 0L, hispanic == 0L, asian_nonhispanic == 0L,
          black_nonhispanic == 0L, other == 0L)) {
    "uninhabited"
  } else {
    c(
      white_nonhispanic = white_nonhispanic,
      hispanic          = hispanic,
      asian_nonhispanic = asian_nonhispanic,
      black_nonhispanic = black_nonhispanic,
      other             = other
    ) %>% 
      which.max(.) %>%
      names()
  }
}

# Get ACS population estimates
get_population <- function(region) {
  v <- jsonlite::fromJSON(api_query[[region]])
  colnames(v) <- v[1, ]
  v %>% 
    .[-1, ] %>% 
    as_tibble() %>% 
    mutate_at(vars(starts_with("B03")), as.integer) %>%
    mutate(
      NAME =
        NAME %>% 
          str_replace(", \\w+$", "") %>% 
          str_replace("[ ]+CCD[ ]*,", ",") %>% 
          str_replace("[ ]*,[ ]*", "\n"),
      population        = B03001_001E,
      white_nonhispanic = group_pct(group = B03002_003E, total = B03001_001E),
      hispanic          = group_pct(group = B03001_003E, total = B03001_001E),
      asian_nonhispanic = group_pct(group = B03002_006E, total = B03001_001E),
      black_nonhispanic = group_pct(group = B03002_004E, total = B03001_001E),
      other =
        if_else(population == 0L, 0L,
                pmax(0L, 100L - white_nonhispanic - hispanic -
                     asian_nonhispanic - black_nonhispanic)),
      largest_group =
        list(
          white_nonhispanic = B03002_003E,
          hispanic          = B03001_003E,
          asian_nonhispanic = B03002_006E,
          black_nonhispanic = B03002_004E,
          other             = B03001_001E - B03002_003E - B03001_003E -
                                B03002_006E - B03002_004E
        ) %>%
        pmap_chr(largest_group)
    ) %>% 
    select(geoid = GEOID, name = NAME, population:largest_group) %>% 
    arrange(geoid)
}

# Get US Census Bureau boundaries
get_boundaries <- function(region) {
  
  # Download and unzip US Census Bureau shapefile
  url <- url_boundaries[[region]]
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
    st_transform(crs = EPSG_WGS84)
}

# Create temp directory
if (!file.exists(dir_tmp)) {
  dir.create(dir_tmp, recursive = TRUE)
}

# Create and write out GeoJSON files for each region
for (region in names(files_out)) {
  get_boundaries(region) %>% 
    filter(aland > 0) %>%
    mutate(affgeoid = str_replace(affgeoid, "00US", "US")) %>% 
    select(-name) %>% 
    left_join(get_population(region), by = c("affgeoid" = "geoid")) %>% 
    mutate(
      density = as.integer(round(population / aland * SQ_METER_SQ_MILE))
    ) %>% 
    arrange(geoid) %>% 
    select(name, population, density, white_nonhispanic:largest_group) %>% 
    st_write(dsn = files_out[[region]], delete_dsn = TRUE)
}

# Remove temporary directory
if (unlink(dir_tmp, recursive = TRUE, force = TRUE)) {
  print("Error: Remove temporary directory failed")
}
  