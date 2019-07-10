import { defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const SIZE_X = 6;
const SIZE_Y = 8;

const spec: ComponentSpec = {
  ...defaultSpec,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
};

export default spec;
