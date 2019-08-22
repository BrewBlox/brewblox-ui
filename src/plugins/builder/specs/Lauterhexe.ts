import { IN_OUT, LEFT } from '../getters';
import { PartSpec } from '../types';

const SIZE_X = 4;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'Lauterhexe',
  cards: [],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: IN_OUT }],
    [IN_OUT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
