// Substitute your Mapbox access token
mapboxgl.accessToken =
    'pk.eyJ1Ijoid2JlaHJtYW4iLCJhIjoiY2o4cTYxaGEwMHE3eDJ2cGNsZ3NyNzNyOCJ9.x_J4N65PR8cuuREbDe-egQ';

// 2016 California average population density (people / square mile)
const CA_DENSITY = 251.9375;
// Population density colors, Brewer YlGnBu
const COLORS_DENSITY = [
  [0, '#ffffd9'],
  [2, '#edf8b1'],
  [5, '#c7e9b4'],
  [15, '#7fcdbb'],
  [CA_DENSITY, '#41b6c4'],
  [500, '#1d91c0'],
  [1500, '#225ea8'],
  [4000, '#0c2c84'],
];

// Base map
const BASE_MAP = {
  'container': 'map',
  'style': 'mapbox://styles/wbehrman/cj90hkcptjxbf2snw5uf8gg1x',
  'center': [-119.4505, 37.1992],
  'zoom': 5,
};

// Sources
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

// Layers
const LAYERS = [
  {
    'layer': {
      'id': 'county-density',
      'type': 'fill',
      'source': 'county',
      'source-layer': 'county',
      'maxzoom': 8,
      'paint': {
        'fill-opacity': 0.75,
        'fill-color': {
          'property': 'density',
          'stops': COLORS_DENSITY,
        },
        'fill-outline-color': '#bfbfbf',
      },
    },
    'before': 'waterway-label',
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
        'fill-opacity': 0.70,
        'fill-color': {
          'property': 'density',
          'stops': COLORS_DENSITY,
        },
        'fill-outline-color': '#bfbfbf',
      },
    },
    'before': 'waterway-label',
  },
  {
    'layer': {
      'id': 'tract-density',
      'type': 'fill',
      'source': 'tract',
      'source-layer': 'tract',
      'minzoom': 11,
      'paint': {
        'fill-opacity': 0.70,
        'fill-color': {
          'property': 'density',
          'stops': COLORS_DENSITY,
        },
        'fill-outline-color': '#bfbfbf',
      },
    },
    'before': 'waterway-label',
  },
];

//==============================================================================

// Initialize map
let map = new mapboxgl.Map(BASE_MAP);

map.on('load', function() {
  // Add sources and layers
  for (const source of SOURCES) {
    map.addSource(source.id, source.source);
  }
  for (const layer of LAYERS) {
    map.addLayer(layer.layer, layer.before);
  }
});
