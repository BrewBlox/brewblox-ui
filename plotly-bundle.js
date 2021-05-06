// Custom distribution bundle for Plotly
// We only import and register the components we actually use
// For more info: https://github.com/plotly/plotly.js#modules
const Plotly = require('plotly-src/lib/core');

Plotly.register([
  require('plotly-src/lib/scatter'),
]);

module.exports = Plotly;
