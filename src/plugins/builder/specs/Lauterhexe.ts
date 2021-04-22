import { CENTER, LEFT } from '@/plugins/builder/getters';
import { PartSpec } from '@/plugins/builder/types';

const SIZE_X = 4;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'Lauterhexe',
  title: 'Filter: lauterhexe',
  cards: [],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: CENTER }],
    [CENTER]: [{ outCoords: LEFT }],
  }),
};

export default spec;
