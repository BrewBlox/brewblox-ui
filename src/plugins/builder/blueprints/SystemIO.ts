import {
  CENTER,
  COLOR_KEY,
  DEFAULT_IO_PRESSURE,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
  RIGHT,
} from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'SystemIO',
  title: 'Global inlet',
  size: () => [1, 1],
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
          outCoords: RIGHT,
          source: true,
          pressure,
          liquids,
        },
      ],
      [RIGHT]: [{ outCoords: CENTER, sink: true }],
    };
  },
};

export default blueprint;
