import { LEFT, RIGHT } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'StraightTube',
  title: 'Tube: straight',
  component: 'StraightTubePartComponent',
  defaultSize: { width: 1, height: 1 },
  transitions: () => ({
    [LEFT]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: LEFT }],
  }),
};

export default blueprint;
