import { ComponentSettings, PersistentPart } from '../state';
import { defaultSettings } from '../components/getters';
import { Coordinates } from '@/helpers/coordinates';
import { slotLocations } from '../helpers/functional';

const SLOTS: [number, number][] = [
  [0, 0],
  [3, 0],
  [3, 5],
  [0, 5],
];

const SIZE_X = 4;
const SIZE_Y = 6;

const settings: ComponentSettings = {
  ...defaultSettings,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
  blockedCoordinates: (part: PersistentPart): Coordinates[] =>
    slotLocations(SLOTS, part, part.rotate, [SIZE_X, SIZE_Y]),
};

export default settings;
