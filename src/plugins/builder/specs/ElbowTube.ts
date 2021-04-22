import { RIGHT, UP } from '@/plugins/builder/getters';
import { PartSpec } from '@/plugins/builder/types';

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
