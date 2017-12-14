/* California race and ethnicity choropleth with counties, county subdivisions,
 * and tracts
 *
 * Author: Bill Behrman
 * Version: 2017-12-13
 */

// Substitute your Mapbox access token
mapboxgl.accessToken =
    'pk.eyJ1Ijoid2JlaHJtYW4iLCJhIjoiY2o4cTYxaGEwMHE3eDJ2cGNsZ3NyNzNyOCJ9.x_J4N65PR8cuuREbDe-egQ';

// Map parameters

const BASE_MAP = {
  'container': 'map',
  // Moonlight style
  'style': 'mapbox://styles/wbehrman/cj90hkcptjxbf2snw5uf8gg1x',
  'center': [-119.4505, 37.1992],
  'zoom': 5,
};

const REGIONS = ['county', 'county-subdivision', 'tract'];

const SOURCE_URL = {
  'county': 'mapbox://wbehrman.9qe09ixj',
  'county-subdivision': 'mapbox://wbehrman.32nll4u7',
  'tract': 'mapbox://wbehrman.8uf324tu'
};
const SOURCES = REGIONS.map(
  region => ({
    'id': region,
    'source': {
      'type': 'vector',
      'url': SOURCE_URL[region],
    },
  })
);

// Zoom levels layers are visible
const ZOOM = {
  'county': {'min': 0, 'max': 8},
  'county-subdivision': {'min': 8, 'max': 11},
  'tract': {'min': 11, 'max': 23},
};
// Race and ethnicity colors
const FILL_COLOR_RACE = [
  'match',
  ['string', ['get', 'largest_group']],
  'white_nonhispanic',
  [
    'curve',
    ['exponential', 1],
    ['number', ['get', 'largest_pct']],
    // Brewer Blues
    0, '#eff3ff',
    20, '#bdd7e7',
    40, '#6baed6',
    60, '#3182bd',
    80, '#08519c',
  ],
  'hispanic',
  [
    'curve',
    ['exponential', 1],
    ['number', ['get', 'largest_pct']],
    // Brewer Oranges
    0, '#feedde',
    20, '#fdbe85',
    40, '#fd8d3c',
    60, '#e6550d',
    80, '#a63603',
  ],
  'asian_nonhispanic',
  [
    'curve',
    ['exponential', 1],
    ['number', ['get', 'largest_pct']],
    // Brewer Greens
    0, '#edf8e9',
    20, '#bae4b3',
    40, '#74c476',
    60, '#31a354',
    80, '#006d2c',
  ],
  'black_nonhispanic',
  [
    'curve',
    ['exponential', 1],
    ['number', ['get', 'largest_pct']],
    // Brewer Purples
    0, '#f2f0f7',
    20, '#cbc9e2',
    40, '#9e9ac8',
    60, '#756bb1',
    80, '#54278f',
  ],
  'other',
  [
    'curve',
    ['exponential', 1],
    ['number', ['get', 'largest_pct']],
    // Brewer Greys
    0, '#f7f7f7',
    20, '#cccccc',
    40, '#969696',
    60, '#636363',
    80, '#252525',
  ],
  'uninhabited',
  [
    'curve',
    ['exponential', 1],
    ['number', ['get', 'largest_pct']],
    // Brewer Greys
    0, '#f7f7f7',
  ],
  // Default
  '#f7f7f7'
];

const LAYERS = REGIONS.map(
  region => ({
    'layer': {
      'id': region + '-race',
      'type': 'fill',
      'source': region,
      'source-layer': region,
      'minzoom': ZOOM[region].min,
      'maxzoom': ZOOM[region].max,
      'paint': {
        'fill-opacity': 0.75,
        'fill-color': FILL_COLOR_RACE,
        'fill-outline-color': '#bfbfbf',
      },
    },
    // Add new layer above this layer
    'before': 'waterway-label',
  })
);

//==============================================================================

// Initialize map
const map = new mapboxgl.Map(BASE_MAP);

// Add sources and layers
map.on('load', () => {
  SOURCES.forEach(source => map.addSource(source.id, source.source));
  LAYERS.forEach(layer => map.addLayer(layer.layer, layer.before));
});
