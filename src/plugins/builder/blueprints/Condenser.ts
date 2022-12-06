import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import { Coordinates } from '@/utils/coordinates';
import {
  CENTER,
  DEFAULT_IO_PRESSURE,
  HOT_WATER,
  MAX_IO_PRESSURE,
  MIN_IO_PRESSURE,
  UP,
} from '../const';

export const SIZE_X = 1;
export const SIZE_Y = 2;
export const DEFAULT_OUTLET_PRESSURE = DEFAULT_IO_PRESSURE / 2;

const blueprint: BuilderBlueprint = {
  type: 'Condenser',
  title: 'Steam condenser',
  cards: [
    {
      component: 'PressureCard',
      props: {
        settingsKey: 'onPressure',
        min: MIN_IO_PRESSURE,
        max: MAX_IO_PRESSURE,
        defaultValue: DEFAULT_OUTLET_PRESSURE,
      },
    },
  ],
  size: () => [SIZE_X, SIZE_Y],
  transitions: (part: PersistentPart) => {
    const bottomOut = new Coordinates([0.5, SIZE_Y, 0]).toString();
    const bottomCenter = new Coordinates([0.5, SIZE_Y - 0.5, 0]).toString();
    return {
      [UP]: [{ outCoords: CENTER, sink: true }],
      [bottomOut]: [{ outCoords: bottomCenter, sink: true }],
      [bottomCenter]: [
        {
          outCoords: bottomOut,
          source: true,
          pressure: part.settings.onPressure ?? DEFAULT_OUTLET_PRESSURE,
          liquids: [HOT_WATER],
        },
      ],
    };
  },
};

export default blueprint;
