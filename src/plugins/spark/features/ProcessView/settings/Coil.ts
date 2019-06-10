import { Coordinates, CoordinatesParam } from '@/helpers/coordinates';

import { defaultSettings } from '../getters';
import { ComponentSettings, PersistentPart } from '../types';

export const COIL_TOP = '0,0.5,0';
export const COIL_BOTTOM = '0,1.5,0';

const BLOCKED: CoordinatesParam[] = [
  [0, 0, 0],
  [0, 1, 0],
];

const SIZE_X = 3;
const SIZE_Y = 2;

const settings: ComponentSettings = {
  ...defaultSettings,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [COIL_TOP]: [{ outCoords: COIL_BOTTOM, friction: 20 }],
    [COIL_BOTTOM]: [{ outCoords: COIL_TOP, friction: 20 }],
  }),
  blockedCoordinates: (part: PersistentPart): Coordinates[] =>
    new Coordinates([part.x, part.y, 0])
      .subSquares(BLOCKED, part.rotate, [SIZE_X, SIZE_Y]),
};

export default settings;
