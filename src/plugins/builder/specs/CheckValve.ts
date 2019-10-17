import { LEFT, RIGHT } from '../getters';
import { PartSpec, Transitions } from '../types';

const spec: PartSpec = {
  id: 'CheckValve',
  title: 'Valve: one way',
  cards: [],
  size: () => [1, 1],
  transitions: (): Transitions => ({
    [LEFT]: [{ outCoords: RIGHT }],
  }),
};

export default spec;
