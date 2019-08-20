import { IN_OUT, LEFT } from '../getters';
import { PartSpec } from '../types';

const spec: PartSpec = {
  id: 'StraightInletTube',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({
    [LEFT]: [{ outCoords: IN_OUT }],
    [IN_OUT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
