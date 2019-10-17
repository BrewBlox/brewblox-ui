import { RIGHT, UP } from '../getters';
import { PartSpec } from '../types';

const spec: PartSpec = {
  id: 'ElbowTube',
  title: 'Tube: elbow',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: UP }],
  }),
};

export default spec;
