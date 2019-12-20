import get from 'lodash/get';

import { CENTER, DEFAULT_IO_PRESSURE, MAX_IO_PRESSURE, MIN_IO_PRESSURE, RIGHT } from '../getters';
import { PartSpec, PersistentPart } from '../types';

const spec: PartSpec = {
  id: 'SystemIO',
  title: 'Global inlet',
  size: () => [1, 1],
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
      ? part.settings.onPressure ?? DEFAULT_IO_PRESSURE
      : 0;
    return {
      [CENTER]: [{
        outCoords: RIGHT,
        pressure,
        liquids: enabled ? part.settings.liquids || [] : [],
        source: true,
      }],
      [RIGHT]: [{ outCoords: CENTER, sink: true }],
    };
  },
};

export default spec;
