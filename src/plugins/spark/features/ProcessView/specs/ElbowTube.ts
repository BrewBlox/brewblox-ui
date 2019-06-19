import { RIGHT, UP, defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: UP }],
  }),
};

export default spec;
