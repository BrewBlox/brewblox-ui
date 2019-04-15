import { ComponentSettings, PersistentPart } from '../state';
import { defaultSettings } from '../getters';
import { Coordinates, CoordinatesParam } from '@/helpers/coordinates';
import { subSquares } from '../helpers/functional';

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
    subSquares(BLOCKED, [part.x, part.y, 0], part.rotate, [SIZE_X, SIZE_Y]),
};

export default settings;
