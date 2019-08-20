import { LEFT, RIGHT } from '../getters';
import { PartSpec } from '../types';

const spec: PartSpec = {
  id: 'StraightTube',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({
    [LEFT]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
