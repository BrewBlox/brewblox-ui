import { CENTER, LEFT } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'DipTube',
  title: 'Kettle inlet: dip',
  component: 'DipTubePartComponent',
  defaultSize: { width: 1, height: 1 },
  transitions: () => ({
    [LEFT]: [{ outCoords: CENTER }],
    [CENTER]: [{ outCoords: LEFT }],
  }),
};

export default blueprint;
