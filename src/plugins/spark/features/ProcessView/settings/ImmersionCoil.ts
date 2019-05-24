import { Coordinates, CoordinatesParam } from '@/helpers/coordinates';

import { defaultSettings } from '../getters';
import { subSquares } from '../helpers/functional';
import { ComponentSettings, PersistentPart } from '../types';

export const COIL_TOP_LEFT = '0.5,0,0';
export const COIL_TOP_RIGHT = '1.5,0,0';

const BLOCKED: CoordinatesParam[] = [
  [0, 0, 0],
  [1, 0, 0],
];

const SIZE_X = 2;
const SIZE_Y = 2;

const settings: ComponentSettings = {
  ...defaultSettings,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [COIL_TOP_LEFT]: [{ outCoords: COIL_TOP_RIGHT, friction: 20 }],
    [COIL_TOP_RIGHT]: [{ outCoords: COIL_TOP_LEFT, friction: 20 }],
  }),
  blockedCoordinates: (part: PersistentPart): Coordinates[] =>
    subSquares(BLOCKED, [part.x, part.y, 0], part.rotate, [SIZE_X, SIZE_Y]),
};

export default settings;
