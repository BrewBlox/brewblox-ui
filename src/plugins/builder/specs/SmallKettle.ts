import { defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const SIZE_X = 2;
const SIZE_Y = 2;

const spec: ComponentSpec = {
  ...defaultSpec,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
};

export default spec;
