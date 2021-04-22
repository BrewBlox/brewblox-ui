import { CENTER, DEFAULT_IO_PRESSURE, MAX_IO_PRESSURE, MIN_IO_PRESSURE, UP } from '@/plugins/builder/getters';
import { PartSpec, PersistentPart } from '@/plugins/builder/types';

const SIZE_X = 2;
const SIZE_Y = 2;

const spec: PartSpec = {
  id: 'ShiftedSystemIO',
  title: 'Global inlet: shifted',
  size: () => [SIZE_X, SIZE_Y],
  cards: [
    {
      component: 'PressureCard',
      props: {
        settingsKey: 'onPressure',
        min: MIN_IO_PRESSURE,
        max: MAX_IO_PRESSURE,
        defaultValue: DEFAULT_IO_PRESSURE,
      },
    },
    { component: 'LiquidSourceCard' },
  ],
  transitions: (part: PersistentPart) => {
    const enabled = part.settings.enabled ?? !!part.settings.pressure;
    const pressure = enabled
      ? part.settings.onPressure ?? DEFAULT_IO_PRESSURE
      : 0;
    return {
      [CENTER]: [{
        outCoords: UP,
        pressure,
        liquids: enabled ? part.settings.liquids || [] : [],
        source: true,
      }],
      [UP]: [{ outCoords: CENTER, sink: true }],
    };
  },
};

export default spec;
