import { BuilderBlueprint } from '@/plugins/builder/types';

export const CFC_TOP_LEFT = '0,0.5,0';
export const CFC_TOP_RIGHT = '3,0.5,0';
export const CFC_BOTTOM_LEFT = '0,1.5,0';
export const CFC_BOTTOM_RIGHT = '3,1.5,0';

const blueprint: BuilderBlueprint = {
  type: 'CounterflowChiller',
  title: 'Counterflow chiller',
  size: () => [3, 2],
  transitions: () => ({
    [CFC_TOP_LEFT]: [{ outCoords: CFC_TOP_RIGHT }],
    [CFC_TOP_RIGHT]: [{ outCoords: CFC_TOP_LEFT }],
    [CFC_BOTTOM_LEFT]: [{ outCoords: CFC_BOTTOM_RIGHT }],
    [CFC_BOTTOM_RIGHT]: [{ outCoords: CFC_BOTTOM_LEFT }],
  }),
};

export default blueprint;
