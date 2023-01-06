import {
  CENTER,
  COLOR_KEY,
  DEFAULT_IO_PRESSURE,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
  UP,
} from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';

const SIZE_X = 2;
const SIZE_Y = 2;

const blueprint: BuilderBlueprint = {
  type: 'ShiftedSystemIO',
  title: 'Global inlet: shifted',
  size: () => [SIZE_X, SIZE_Y],
  transitions: (part: PersistentPart) => {
    const enabled = Boolean(part.settings[IO_ENABLED_KEY]);
    const pressure = enabled
      ? Number(part.settings[IO_PRESSURE_KEY] ?? DEFAULT_IO_PRESSURE)
      : 0;
    const color = part.settings[COLOR_KEY];
    const liquids = enabled && color ? [color] : [];
    return {
      [CENTER]: [
        {
          pressure,
          liquids,
          outCoords: UP,
          source: true,
        },
      ],
      [UP]: [{ outCoords: CENTER, sink: true }],
    };
  },
};

export default blueprint;
