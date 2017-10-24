/* California population density choropleth with counties, county subdivisions,
 * and tracts
 *
 * Author: Bill Behrman
 * Version: 2017-10-23
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

const SOURCES = [
  {
    'id': 'county',
    'source': {
      'type': 'vector',
      'url': 'mapbox://wbehrman.4cwlzwkx',
    },
  },
  {
    'id': 'county-subdivision',
    'source': {
      'type': 'vector',
      'url': 'mapbox://wbehrman.6xx2hlmh',
    },
  },
  {
    'id': 'tract',
    'source': {
      'type': 'vector',
      'url': 'mapbox://wbehrman.c3t70djq',
    },
  },
];

const FILL_OPACITY = 0.75;
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
const FILL_COLOR_DENSITY = {
  'property': 'density',
  'stops': STOPS_DENSITY,
};
const FILL_OUTLINE_COLOR = '#bfbfbf';
// Add new layer above this layer
const BEFORE = 'waterway-label';

const LAYERS = [
  {
    'layer': {
      'id': 'county-density',
      'type': 'fill',
      'source': 'county',
      'source-layer': 'county',
      'maxzoom': 8,
      'paint': {
        'fill-opacity': FILL_OPACITY,
        'fill-color': FILL_COLOR_DENSITY,
        'fill-outline-color': FILL_OUTLINE_COLOR,
      },
    },
    'before': BEFORE,
  },
  {
    'layer': {
      'id': 'county-subdivision-density',
      'type': 'fill',
      'source': 'county-subdivision',
      'source-layer': 'county-subdivision',
      'minzoom': 8,
      'maxzoom': 11,
      'paint': {
        'fill-opacity': FILL_OPACITY,
        'fill-color': FILL_COLOR_DENSITY,
        'fill-outline-color': FILL_OUTLINE_COLOR,
      },
    },
    'before': BEFORE,
  },
  {
    'layer': {
      'id': 'tract-density',
      'type': 'fill',
      'source': 'tract',
      'source-layer': 'tract',
      'minzoom': 11,
      'paint': {
        'fill-opacity': FILL_OPACITY,
        'fill-color': FILL_COLOR_DENSITY,
        'fill-outline-color': FILL_OUTLINE_COLOR,
      },
    },
    'before': BEFORE,
  },
];

//==============================================================================

// Initialize map
const map = new mapboxgl.Map(BASE_MAP);

map.on('load', function() {
  // Add sources and layers
  for (const source of SOURCES) {
    map.addSource(source.id, source.source);
  }
  for (const layer of LAYERS) {
    map.addLayer(layer.layer, layer.before);
  }
});
