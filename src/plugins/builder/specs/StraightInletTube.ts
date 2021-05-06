import { CENTER, LEFT } from '@/plugins/builder/const';
import { PartSpec } from '@/plugins/builder/types';

const spec: PartSpec = {
  id: 'StraightInletTube',
  title: 'Kettle inlet: straight',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({
    [LEFT]: [{ outCoords: CENTER }],
    [CENTER]: [{ outCoords: LEFT }],
  }),
};

export default spec;
