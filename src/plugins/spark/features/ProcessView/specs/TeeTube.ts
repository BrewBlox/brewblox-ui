import { LEFT, RIGHT, UP, defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }, { outCoords: LEFT }],
    [RIGHT]: [{ outCoords: UP }, { outCoords: LEFT }],
    [LEFT]: [{ outCoords: UP }, { outCoords: RIGHT }],
  }),
};

export default spec;
