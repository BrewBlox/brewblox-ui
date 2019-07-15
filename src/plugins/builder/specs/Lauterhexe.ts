import { IN_OUT, LEFT, defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const SIZE_X = 4;
const SIZE_Y = 1;

const spec: ComponentSpec = {
  ...defaultSpec,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: IN_OUT }],
    [IN_OUT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
