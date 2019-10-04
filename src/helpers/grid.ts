/**
 * These values are also declared in the CSS styling in GridContainer.vue
 * These helper functions are for calculating the size in JS.
 */

const GRID_SQUARE_SIZE = 100;
const GRID_GAP_SIZE = 20;

interface Sized {
  cols: number;
  rows: number;
}

const calcGridSize = (val: number): number =>
  (val * GRID_SQUARE_SIZE + ((val - 1) * GRID_GAP_SIZE));

export const widgetGridSize = ({ cols, rows }: Sized): Sized =>
  ({
    cols: calcGridSize(cols),
    rows: calcGridSize(rows),
  });
