// Custom distribution bundle for Plotly
// We only import and register the components we use
// For more info: https://github.com/plotly/plotly.js#modules
//
// In vite.config.ts we add an alias to redirect imports
// The original plotly can be accessed as 'plotly-dist'
import Plotly from 'plotly-dist/lib/core';
import scatter from 'plotly-dist/lib/scatter';

Plotly.register([scatter]);

export default Plotly;
