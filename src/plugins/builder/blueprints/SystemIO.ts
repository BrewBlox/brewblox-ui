import {
  CENTER,
  DEFAULT_IO_PRESSURE,
  DEPRECATED_IO_PRESSURE_KEY,
  IO_ENABLED_KEY,
  IO_LIQUIDS_KEY,
  IO_PRESSURE_KEY,
  MAX_IO_PRESSURE,
  MIN_IO_PRESSURE,
  RIGHT,
} from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'SystemIO',
  title: 'Global inlet',
  size: () => [1, 1],
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
          outCoords: RIGHT,
          pressure,
          liquids: enabled ? part.settings[IO_LIQUIDS_KEY] || [] : [],
          source: true,
        },
      ],
      [RIGHT]: [{ outCoords: CENTER, sink: true }],
    };
  },
};

export default blueprint;
