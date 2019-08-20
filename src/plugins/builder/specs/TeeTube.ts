import { LEFT, RIGHT, UP } from '../getters';
import { PartSpec } from '../types';

const spec: PartSpec = {
  id: 'TeeTube',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }, { outCoords: LEFT }],
    [RIGHT]: [{ outCoords: UP }, { outCoords: LEFT }],
    [LEFT]: [{ outCoords: UP }, { outCoords: RIGHT }],
  }),
};

export default spec;
