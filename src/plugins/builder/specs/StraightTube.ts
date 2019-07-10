import { LEFT, RIGHT, defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  transitions: () => ({
    [LEFT]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
