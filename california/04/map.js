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

// 2016 California population density (people / square mile)
const CA_DENSITY = 251.9375;
// Zoom levels layers are visible
const ZOOM = {
  'county': {'min': 0, 'max': 8},
  'county-subdivision': {'min': 8, 'max': 11},
  'tract': {'min': 11, 'max': 23},
};
// Fill colors
const FILL_COLOR = {
  // Population density
  'density': [
    'interpolate',
    ['exponential', 1],
    ['get', 'density'],
    // Brewer YlGnBu
    0, '#ffffd9',
    2, '#edf8b1',
    5, '#c7e9b4',
    15, '#7fcdbb',
    CA_DENSITY, '#41b6c4',
    500, '#1d91c0',
    1500, '#225ea8',
    4000, '#0c2c84',
  ],
  // Race and ethnicity
  'race': [
    'match',
    ['string', ['get', 'largest_group']],
    'white_nonhispanic',
    [
      'interpolate',
      ['exponential', 1],
      ['get', 'largest_pct'],
      // Brewer Blues
      0, '#eff3ff',
      20, '#bdd7e7',
      40, '#6baed6',
      60, '#3182bd',
      80, '#08519c',
    ],
    'hispanic',
    [
      'interpolate',
      ['exponential', 1],
      ['get', 'largest_pct'],
      // Brewer Oranges
      0, '#feedde',
      20, '#fdbe85',
      40, '#fd8d3c',
      60, '#e6550d',
      80, '#a63603',
    ],
    'asian_nonhispanic',
    [
      'interpolate',
      ['exponential', 1],
      ['get', 'largest_pct'],
      // Brewer Greens
      0, '#edf8e9',
      20, '#bae4b3',
      40, '#74c476',
      60, '#31a354',
      80, '#006d2c',
    ],
    'black_nonhispanic',
    [
      'interpolate',
      ['exponential', 1],
      ['get', 'largest_pct'],
      // Brewer Purples
      0, '#f2f0f7',
      20, '#cbc9e2',
      40, '#9e9ac8',
      60, '#756bb1',
      80, '#54278f',
    ],
    'other',
    [
      'interpolate',
      ['exponential', 1],
      ['get', 'largest_pct'],
      // Brewer Greys
      0, '#f7f7f7',
      20, '#cccccc',
      40, '#969696',
      60, '#636363',
      80, '#252525',
    ],
    'uninhabited',
    [
      'interpolate',
      ['exponential', 1],
      ['get', 'largest_pct'],
      // Brewer Greys
      0, '#f7f7f7',
    ],
    // Default
    '#f7f7f7'
  ],
};
// Add new layer above this layer
const BEFORE = 'waterway-label';

const LAYERS_FILL = REGIONS.map(
  region => ({
    'layer': {
      'id': region + '-fill',
      'type': 'fill',
      'source': region,
      'source-layer': region,
      'minzoom': ZOOM[region].min,
      'maxzoom': ZOOM[region].max,
      'paint': {
        'fill-opacity': 0.75,
        'fill-color': FILL_COLOR.density,
        'fill-outline-color': '#bfbfbf',
      },
    },
    'before': BEFORE,
  })
);

const geoidFilter = geoid => ['==', ['string', ['get', 'geoid']], geoid];
const LAYERS_LINE = REGIONS.map(
  region => ({
    'layer': {
      'id': region + '-line',
      'type': 'line',
      'source': region,
      'source-layer': region,
      'minzoom': ZOOM[region].min,
      'maxzoom': ZOOM[region].max,
      'filter': geoidFilter(''),
      'paint': {
        'line-color': '#ffffff',
        'line-width': 1.5,
      },
    },
    'before': BEFORE,
  })
);

const LAYERS = LAYERS_FILL.concat(LAYERS_LINE);

//==============================================================================

// Initialize map
const map = new mapboxgl.Map(BASE_MAP);

// Add sources and layers
map.on('load', () => {
  SOURCES.forEach(source => map.addSource(source.id, source.source));
  LAYERS.forEach(layer => map.addLayer(layer.layer, layer.before));
});

// Add layer selector
const select = document.getElementById('select-layer');
select.addEventListener('change', () => {
  LAYERS_FILL.forEach(layer => {
    map.setPaintProperty(
      layer.layer.id,
      'fill-color',
      FILL_COLOR[select.value]
    );
  });
});

// Add highlighting
LAYERS_FILL.forEach(layer => {
  map.on('mousemove', layer.layer.id, e => {
    map.setFilter(
      layer.layer.id.replace('-fill', '-line'),
      geoidFilter(
        map.queryRenderedFeatures(e.point, {'layers': [layer.layer.id],})[0]
          .properties.geoid
      )
    );
  });
  map.on('mouseleave', layer.layer.id, () => {
    map.setFilter(layer.layer.id.replace('-fill', '-line'), geoidFilter(''));
  });
});

// Add tooltip

// Initialize tool-tip
const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 10
});

// Add and remove tooltip as needed
LAYERS_FILL.forEach(layer => {
  map.on('mousemove', layer.layer.id, e => {
    const feature = e.features[0];

    popup.setLngLat(e.lngLat)
          .setHTML(format_tooltip(feature))
          .addTo(map);
  });

  map.on('mouseleave', layer.layer.id, function() {
        popup.remove();
    });
});

// Format tooltip text
function format_tooltip(feature) {
  console.log(feature.properties)
  const name = '<h1>' + feature.properties.name + '</h1>'
  return '<div class="tooltip">' + name + '</div'
}
