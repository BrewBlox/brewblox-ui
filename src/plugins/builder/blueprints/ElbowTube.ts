import { RIGHT, UP } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'ElbowTube',
  title: 'Tube: elbow',
  component: 'ElbowTubePartComponent',
  defaultSize: { width: 1, height: 1 },
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: UP }],
  }),
};

export default blueprint;
