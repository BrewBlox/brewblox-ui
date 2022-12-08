import {
  CENTER,
  DEFAULT_IO_PRESSURE,
  DEPRECATED_IO_PRESSURE_KEY,
  IO_ENABLED_KEY,
  IO_LIQUIDS_KEY,
  IO_PRESSURE_KEY,
  MAX_IO_PRESSURE,
  MIN_IO_PRESSURE,
  UP,
} from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';

const SIZE_X = 2;
const SIZE_Y = 2;

const blueprint: BuilderBlueprint = {
  type: 'ShiftedSystemIO',
  title: 'Global inlet: shifted',
  size: () => [SIZE_X, SIZE_Y],
  cards: [
    {
      component: 'LiquidSourceCard',
      props: {},
    },
    {
      component: 'PressureCard',
      props: {
        settingsKey: IO_PRESSURE_KEY,
        min: MIN_IO_PRESSURE,
        max: MAX_IO_PRESSURE,
        defaultValue: DEFAULT_IO_PRESSURE,
      },
    },
  ],
  transitions: (part: PersistentPart) => {
    const enabled = Boolean(
      part.settings[IO_ENABLED_KEY] ??
        part.settings[DEPRECATED_IO_PRESSURE_KEY],
    );
    const pressure = enabled
      ? part.settings[IO_PRESSURE_KEY] ?? DEFAULT_IO_PRESSURE
      : 0;
    return {
      [CENTER]: [
        {
          outCoords: UP,
          pressure,
          liquids: enabled ? part.settings[IO_LIQUIDS_KEY] || [] : [],
          source: true,
        },
      ],
      [UP]: [{ outCoords: CENTER, sink: true }],
    };
  },
};

export default blueprint;
