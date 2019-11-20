import get from 'lodash/get';

import { DEFAULT_PUMP_PRESSURE, LEFT, MAX_PUMP_PRESSURE, MIN_PUMP_PRESSURE, RIGHT } from '../getters';
import { PartSpec, PersistentPart } from '../types';

const spec: PartSpec = {
  id: 'GravityTube',
  title: 'Tube: gravity',
  size: () => [1, 1],
  cards: [
    {
      component: 'PressureCard',
      props: {
        settingsKey: 'onPressure',
        min: MIN_PUMP_PRESSURE,
        max: MAX_PUMP_PRESSURE,
        defaultValue: DEFAULT_PUMP_PRESSURE,
      },
    },
  ],
  transitions: (part: PersistentPart) => {
    const pressure = get(part.settings, 'onPressure', DEFAULT_PUMP_PRESSURE);
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT, pressure }],
    };
  },
};

export default spec;
