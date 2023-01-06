import { CENTER, LEFT } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

const SIZE_X = 4;
const SIZE_Y = 1;

const blueprint: BuilderBlueprint = {
  type: 'Lauterhexe',
  title: 'Filter: lauterhexe',
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: CENTER }],
    [CENTER]: [{ outCoords: LEFT }],
  }),
};

export default blueprint;
