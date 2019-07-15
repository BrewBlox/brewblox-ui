import { IN_OUT, LEFT, defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const SIZE_X = 1;
const SIZE_Y = 4;

const spec: ComponentSpec = {
  ...defaultSpec,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: IN_OUT }],
    [IN_OUT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
