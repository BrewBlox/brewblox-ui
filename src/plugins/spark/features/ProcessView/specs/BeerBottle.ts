import { defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const SIZE_X = 1;
const SIZE_Y = 2;

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [
    { component: 'ColorCard' },
  ],
  size: () => [SIZE_X, SIZE_Y],
};

export default spec;
