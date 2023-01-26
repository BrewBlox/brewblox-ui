import { LEFT, RIGHT } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'CheckValve',
  title: 'Valve: one way',
  component: 'CheckValvePartComponent',
  defaultSize: { width: 1, height: 1 },
  transitions: () => ({
    [LEFT]: [{ outCoords: RIGHT }],
  }),
};

export default blueprint;
