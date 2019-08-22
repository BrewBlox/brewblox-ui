import { PartSpec } from '../types';

const SIZE_X = 1;
const SIZE_Y = 2;

const spec: PartSpec = {
  id: 'BeerBottle',
  cards: [
    { component: 'ColorCard' },
  ],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
};

export default spec;
