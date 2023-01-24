import { BuilderBlueprint } from '@/plugins/builder/types';

export const COIL_TOP_LEFT = '0.5,0,0';
export const COIL_TOP_RIGHT = '1.5,0,0';

const blueprint: BuilderBlueprint = {
  type: 'ImmersionCoil',
  title: 'Coil: immersion',
  component: 'ImmersionCoilPartComponent',
  defaultSize: { width: 2, height: 2 },
  transitions: () => ({
    [COIL_TOP_LEFT]: [{ outCoords: COIL_TOP_RIGHT, friction: 20 }],
    [COIL_TOP_RIGHT]: [{ outCoords: COIL_TOP_LEFT, friction: 20 }],
  }),
};

export default blueprint;
