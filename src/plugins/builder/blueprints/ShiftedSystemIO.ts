import {
  CENTER,
  DEFAULT_IO_PRESSURE,
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
    { component: 'LiquidSourceCard' },
    {
      component: 'PressureCard',
      props: {
        settingsKey: 'onPressure',
        min: MIN_IO_PRESSURE,
        max: MAX_IO_PRESSURE,
        defaultValue: DEFAULT_IO_PRESSURE,
      },
    },
  ],
  transitions: (part: PersistentPart) => {
    const enabled = part.settings.enabled ?? !!part.settings.pressure;
    const pressure = enabled
      ? part.settings.onPressure ?? DEFAULT_IO_PRESSURE
      : 0;
    return {
      [CENTER]: [
        {
          outCoords: UP,
          pressure,
          liquids: enabled ? part.settings.liquids || [] : [],
          source: true,
        },
      ],
      [UP]: [{ outCoords: CENTER, sink: true }],
    };
  },
};

export default blueprint;
