import { defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

export const COIL_TOP_LEFT = '0.5,0,0';
export const COIL_TOP_RIGHT = '1.5,0,0';

const SIZE_X = 2;
const SIZE_Y = 2;

const spec: ComponentSpec = {
  ...defaultSpec,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [COIL_TOP_LEFT]: [{ outCoords: COIL_TOP_RIGHT, friction: 20 }],
    [COIL_TOP_RIGHT]: [{ outCoords: COIL_TOP_LEFT, friction: 20 }],
  }),
};

export default spec;
