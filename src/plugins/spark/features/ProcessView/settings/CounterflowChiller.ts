import { Coordinates, CoordinatesParam } from '@/helpers/coordinates';

import { defaultSettings } from '../getters';
import { subSquares } from '../helpers/functional';
import { ComponentSettings, PersistentPart } from '../types';

export const CFC_TOP_LEFT = '0,0.5,0';
export const CFC_TOP_RIGHT = '3,0.5,0';
export const CFC_BOTTOM_LEFT = '0,1.5,0';
export const CFC_BOTTOM_RIGHT = '3,1.5,0';

const BLOCKED: CoordinatesParam[] = [
  [0, 0, 0],
  [2, 0, 0],
  [0, 1, 0],
  [2, 1, 0],
];

const SIZE_X = 3;
const SIZE_Y = 2;

const settings: ComponentSettings = {
  ...defaultSettings,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [CFC_TOP_LEFT]: [{ outCoords: CFC_TOP_RIGHT }],
    [CFC_TOP_RIGHT]: [{ outCoords: CFC_TOP_LEFT }],
    [CFC_BOTTOM_LEFT]: [{ outCoords: CFC_BOTTOM_RIGHT }],
    [CFC_BOTTOM_RIGHT]: [{ outCoords: CFC_BOTTOM_LEFT }],
  }),
  blockedCoordinates: (part: PersistentPart): Coordinates[] =>
    subSquares(BLOCKED, [part.x, part.y, 0], part.rotate, [SIZE_X, SIZE_Y]),
};

export default settings;
