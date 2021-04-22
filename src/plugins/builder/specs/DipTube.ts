import { CENTER, LEFT } from '@/plugins/builder/getters';
import { PartSpec } from '@/plugins/builder/types';

const spec: PartSpec = {
  id: 'DipTube',
  title: 'Kettle inlet: dip',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({
    [LEFT]: [{ outCoords: CENTER }],
    [CENTER]: [{ outCoords: LEFT }],
  }),
};

export default spec;
