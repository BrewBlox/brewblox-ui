import { defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const SIZE_X = 1;
const SIZE_Y = 1;

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: ['SensorPartCard'],
  size: () => [SIZE_X, SIZE_Y],
};

export default spec;
