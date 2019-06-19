import { LEFT, RIGHT, defaultSpec } from '../getters';
import { ComponentSpec, Transitions } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  transitions: (): Transitions => ({
    [LEFT]: [{ outCoords: RIGHT }],
  }),
};

export default spec;
