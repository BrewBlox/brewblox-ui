import { defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

export const COIL_TOP = '0,0.5,0';
export const COIL_BOTTOM = '0,1.5,0';

const SIZE_X = 3;
const SIZE_Y = 2;

const spec: ComponentSpec = {
  ...defaultSpec,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [COIL_TOP]: [{ outCoords: COIL_BOTTOM, friction: 20 }],
    [COIL_BOTTOM]: [{ outCoords: COIL_TOP, friction: 20 }],
  }),
};

export default spec;
