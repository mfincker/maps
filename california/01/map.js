/* California population density choropleth with counties, county subdivisions,
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
// 2016 California population density (people / square mile)
const CA_DENSITY = 251.9375;
// Population density colors, Brewer YlGnBu
const STOPS_DENSITY = [
  [0, '#ffffd9'],
  [2, '#edf8b1'],
  [5, '#c7e9b4'],
  [15, '#7fcdbb'],
  [CA_DENSITY, '#41b6c4'],
  [500, '#1d91c0'],
  [1500, '#225ea8'],
  [4000, '#0c2c84'],
];
const LAYERS = REGIONS.map(
  region => ({
    'layer': {
      'id': region + '-density',
      'type': 'fill',
      'source': region,
      'source-layer': region,
      'minzoom': ZOOM[region].min,
      'maxzoom': ZOOM[region].max,
      'paint': {
        'fill-opacity': 0.75,
        'fill-color': {
          'property': 'density',
          'stops': STOPS_DENSITY,
        },
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
