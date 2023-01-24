import { CENTER, LEFT } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'Lauterhexe',
  title: 'Filter: lauterhexe',
  component: 'LauterhexePartComponent',
  defaultSize: { width: 4, height: 1 },
  transitions: () => ({
    [LEFT]: [{ outCoords: CENTER }],
    [CENTER]: [{ outCoords: LEFT }],
  }),
};

export default blueprint;
