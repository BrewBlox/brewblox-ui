import { LEFT, RIGHT } from '@/plugins/builder/const';
import { PartSpec, Transitions } from '@/plugins/builder/types';

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
