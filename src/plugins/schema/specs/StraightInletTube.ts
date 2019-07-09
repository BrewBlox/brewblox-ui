import { IN_OUT, LEFT, defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  transitions: () => ({
    [LEFT]: [{ outCoords: IN_OUT }],
    [IN_OUT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
