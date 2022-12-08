import {
  DEFAULT_PUMP_PRESSURE,
  IO_PRESSURE_KEY,
  LEFT,
  MAX_PUMP_PRESSURE,
  MIN_PUMP_PRESSURE,
  RIGHT,
} from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'GravityTube',
  title: 'Tube: gravity',
  size: () => [1, 1],
  cards: [
    {
      component: 'PressureCard',
      props: {
        settingsKey: IO_PRESSURE_KEY,
        min: MIN_PUMP_PRESSURE,
        max: MAX_PUMP_PRESSURE,
        defaultValue: DEFAULT_PUMP_PRESSURE,
      },
    },
  ],
  transitions: (part: PersistentPart) => {
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [
        {
          outCoords: LEFT,
          pressure: Number(
            part.settings[IO_PRESSURE_KEY] ?? DEFAULT_PUMP_PRESSURE,
          ),
        },
      ],
    };
  },
};

export default blueprint;
