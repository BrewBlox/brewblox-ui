import { DOWN, LEFT, RIGHT, UP } from '../getters';
import { PartSpec } from '../types';

const spec: PartSpec = {
  id: 'BridgeTube',
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
