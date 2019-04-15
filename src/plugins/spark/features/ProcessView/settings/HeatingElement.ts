import { ComponentSettings, PersistentPart } from '../state';
import { defaultSettings } from '../components/getters';
import { Coordinates, CoordinatesParam } from '@/helpers/coordinates';
import { subSquares } from '../helpers/functional';

const BLOCKED: CoordinatesParam[] = [
  [0, 0, 0],
  [1, 0, 0],
];

const SIZE_X = 5;
const SIZE_Y = 1;

const settings: ComponentSettings = {
  ...defaultSettings,
  cards: ['PwmPartCard'],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
  blockedCoordinates: (part: PersistentPart): Coordinates[] =>
    subSquares(BLOCKED, [part.x, part.y, 0], part.rotate, [SIZE_X, SIZE_Y]),
};

export default settings;
