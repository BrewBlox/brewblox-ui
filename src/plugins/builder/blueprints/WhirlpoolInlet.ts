import { LEFT } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

const SIZE_X = 1;
const SIZE_Y = 4;

// Center of SIZE_Y - 1
const OUT = '0.5,3.5,0';

const blueprint: BuilderBlueprint = {
  type: 'WhirlpoolInlet',
  title: 'Kettle inlet: whirlpool',
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: OUT }],
    [OUT]: [{ outCoords: LEFT }],
  }),
};

export default blueprint;
