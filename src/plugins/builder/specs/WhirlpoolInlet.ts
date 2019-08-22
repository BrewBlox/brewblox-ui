import { IN_OUT, LEFT } from '../getters';
import { PartSpec } from '../types';

const SIZE_X = 1;
const SIZE_Y = 4;

const spec: PartSpec = {
  id: 'WhirlpoolInlet',
  cards: [],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: IN_OUT }],
    [IN_OUT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
