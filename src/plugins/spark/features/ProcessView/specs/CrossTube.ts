import { DOWN, LEFT, RIGHT, UP, defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }, { outCoords: LEFT }, { outCoords: DOWN }],
    [RIGHT]: [{ outCoords: UP }, { outCoords: LEFT }, { outCoords: DOWN }],
    [LEFT]: [{ outCoords: UP }, { outCoords: RIGHT }, { outCoords: DOWN }],
    [DOWN]: [{ outCoords: UP }, { outCoords: LEFT }, { outCoords: RIGHT }],
  }),
};

export default spec;
