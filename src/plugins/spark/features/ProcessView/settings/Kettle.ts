import { ComponentSettings, PersistentPart } from '../state';
import { defaultSettings } from '../components/getters';
import { Coordinates } from '@/helpers/coordinates';

const SLOTS = [
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
  blockedCoordinates: (part: PersistentPart): Coordinates[] => {
    // anchor coordinates @ 0 rotation
    const origin =
      new Coordinates([part.x, part.y])
        .rotateSquare(-part.rotate, part.rotate, [SIZE_X, SIZE_Y]);
    const blocked = SLOTS
      .map(([x, y]) =>
        new Coordinates([origin.x + x, origin.y + y])
          .rotateSquare(part.rotate, 0, [SIZE_X, SIZE_Y], [x, y])
      );
    return blocked;
  },
};

export default settings;
