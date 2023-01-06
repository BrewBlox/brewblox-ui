import {
  DEFAULT_PUMP_PRESSURE,
  IO_PRESSURE_KEY,
  LEFT,
  RIGHT,
} from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'GravityTube',
  title: 'Tube: gravity',
  size: () => [1, 1],
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
