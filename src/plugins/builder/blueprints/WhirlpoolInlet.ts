import { LEFT } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

// Center of height - 1
const OUT = '0.5,3.5,0';

const blueprint: BuilderBlueprint = {
  type: 'WhirlpoolInlet',
  title: 'Kettle inlet: whirlpool',
  size: () => [1, 4],
  transitions: () => ({
    [LEFT]: [{ outCoords: OUT }],
    [OUT]: [{ outCoords: LEFT }],
  }),
};

export default blueprint;
