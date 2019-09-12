import { Coordinates } from '@/helpers/coordinates';

import { CENTER, LEFT } from '../getters';
import { PartSpec } from '../types';

const SIZE_X = 1;
const SIZE_Y = 4;
const OUT = new Coordinates(CENTER)
  .translate([0, SIZE_Y - 1, 0])
  .toString();

const spec: PartSpec = {
  id: 'WhirlpoolInlet',
  cards: [],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: OUT }],
    [OUT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
