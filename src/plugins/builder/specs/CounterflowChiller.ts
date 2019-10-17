import { PartSpec } from '../types';

export const CFC_TOP_LEFT = '0,0.5,0';
export const CFC_TOP_RIGHT = '3,0.5,0';
export const CFC_BOTTOM_LEFT = '0,1.5,0';
export const CFC_BOTTOM_RIGHT = '3,1.5,0';

const SIZE_X = 3;
const SIZE_Y = 2;

const spec: PartSpec = {
  id: 'CounterflowChiller',
  title: 'Counterflow chiller',
  cards: [],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [CFC_TOP_LEFT]: [{ outCoords: CFC_TOP_RIGHT }],
    [CFC_TOP_RIGHT]: [{ outCoords: CFC_TOP_LEFT }],
    [CFC_BOTTOM_LEFT]: [{ outCoords: CFC_BOTTOM_RIGHT }],
    [CFC_BOTTOM_RIGHT]: [{ outCoords: CFC_BOTTOM_LEFT }],
  }),
};

export default spec;
