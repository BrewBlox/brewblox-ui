// Custom distribution bundle for Plotly
// We only import and register the components we use
// For more info: https://github.com/plotly/plotly.js#modules
//
// In webpack configuration (quasar.conf.js) we add an alias to redirect imports
// The original plotly can be accessed as 'plotly-dist'
const Plotly = require('plotly-dist/lib/core');

Plotly.register([require('plotly-dist/lib/scatter')]);

module.exports = Plotly;
