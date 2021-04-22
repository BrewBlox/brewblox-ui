import { DOWN, LEFT, RIGHT, UP } from '@/plugins/builder/getters';
import { PartSpec } from '@/plugins/builder/types';

const spec: PartSpec = {
  id: 'BridgeTube',
  title: 'Tube: bridge',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({
    // bridge (high)
    [LEFT]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: LEFT }],
    // straight (low)
    [UP]: [{ outCoords: DOWN }],
    [DOWN]: [{ outCoords: UP }],
  }),
};

export default spec;
