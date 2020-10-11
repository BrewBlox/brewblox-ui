/**
 * Example helper script for calculating transformed SVG paths.
 * Purely to be used as dev tool, with the results copied into source code.
 */
const svgpath = require('svgpath');

const transformed = svgpath('M10.5,21 c1.4-5.1,5.4-9.1,10.5-10.5')
  .transform('translate(50, 0) scale(-1, 1)')
  .round(1)
  .toString();

console.log(transformed);
