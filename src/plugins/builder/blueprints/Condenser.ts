import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import {
  CENTER,
  DEFAULT_IO_PRESSURE,
  HOT_WATER,
  IO_PRESSURE_KEY,
  MAX_IO_PRESSURE,
  MIN_IO_PRESSURE,
  UP,
} from '../const';

export const MIN_OUTLET_PRESSURE = MIN_IO_PRESSURE;
export const MAX_OUTLET_PRESSURE = MAX_IO_PRESSURE;
export const DEFAULT_OUTLET_PRESSURE = DEFAULT_IO_PRESSURE / 2;

const BOTTOM_OUT = '0.5,2,0';
const BOTTOM_CENTER = '0.5,1.5,0';

const blueprint: BuilderBlueprint = {
  type: 'Condenser',
  title: 'Steam condenser',
  size: () => [1, 2],
  transitions: (part: PersistentPart) => {
    const pressure = Number(
      part.settings[IO_PRESSURE_KEY] ?? DEFAULT_OUTLET_PRESSURE,
    );
    return {
      [UP]: [{ outCoords: CENTER, sink: true }],
      [BOTTOM_OUT]: [{ outCoords: BOTTOM_CENTER, sink: true }],
      [BOTTOM_CENTER]: [
        {
          outCoords: BOTTOM_OUT,
          source: true,
          pressure,
          liquids: [HOT_WATER],
        },
      ],
    };
  },
};

export default blueprint;
