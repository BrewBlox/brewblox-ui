import {
  CENTER,
  COLOR_KEY,
  DEFAULT_IO_PRESSURE,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
  UP,
} from '@/plugins/builder/const';
import { BuilderBlueprint, BuilderPart } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'ShiftedSystemIO',
  title: 'Global inlet: shifted',
  component: 'ShiftedSystemIOPartComponent',
  defaultSize: { width: 2, height: 2 },
  transitions: (part: BuilderPart) => {
    const enabled = Boolean(part.settings[IO_ENABLED_KEY]);
    const pressure = enabled
      ? Number(part.settings[IO_PRESSURE_KEY] ?? DEFAULT_IO_PRESSURE)
      : 0;
    const color = part.settings[COLOR_KEY];
    const liquids = enabled && color ? [color] : [];
    return {
      [CENTER]: [
        {
          outCoords: UP,
          source: true,
          pressure,
          liquids,
        },
      ],
      [UP]: [{ outCoords: CENTER, sink: true }],
    };
  },
};

export default blueprint;
