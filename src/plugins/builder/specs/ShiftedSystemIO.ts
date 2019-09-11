import get from 'lodash/get';

import { CENTER, DEFAULT_IO_PRESSURE, MAX_IO_PRESSURE, MIN_IO_PRESSURE, UP } from '../getters';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 2;
const SIZE_Y = 2;

const spec: PartSpec = {
  id: 'ShiftedSystemIO',
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
    const enabled = get(part.settings, 'enabled', !!part.settings.pressure);
    const pressure = enabled
      ? get(part.settings, 'onPressure', DEFAULT_IO_PRESSURE)
      : 0;
    return {
      [CENTER]: [{
        outCoords: UP,
        pressure,
        liquids: part.settings.liquids || [],
        source: true,
      }],
      [UP]: [{ outCoords: CENTER, sink: true }],
    };
  },
};

export default spec;
