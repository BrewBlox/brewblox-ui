import { ComponentSettings, PersistentPart } from '../state';
import { defaultSettings } from '../components/getters';
import { Coordinates, CoordinatesParam } from '@/helpers/coordinates';
import { subSquares } from '../helpers/functional';

const BLOCKED: CoordinatesParam[] = [
  [0, 0],
];

const SIZE_X = 4;
const SIZE_Y = 1;

const settings: ComponentSettings = {
  ...defaultSettings,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
  blockedCoordinates: (part: PersistentPart): Coordinates[] =>
    subSquares(BLOCKED, part, part.rotate, [SIZE_X, SIZE_Y]),
};

export default settings;
