import { LEFT, RIGHT } from '@/plugins/builder/getters';
import { PartSpec } from '@/plugins/builder/types';

const spec: PartSpec = {
  id: 'StraightTube',
  title: 'Tube: straight',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({
    [LEFT]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
