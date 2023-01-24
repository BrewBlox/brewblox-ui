import {
  DEFAULT_PUMP_PRESSURE,
  IO_PRESSURE_KEY,
  LEFT,
  RIGHT,
} from '@/plugins/builder/const';
import { BuilderBlueprint, BuilderPart } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'GravityTube',
  title: 'Tube: gravity',
  component: 'GravityTubePartComponent',
  defaultSize: { width: 1, height: 1 },
  transitions: (part: BuilderPart) => {
    const pressure = Number(
      part.settings[IO_PRESSURE_KEY] ?? DEFAULT_PUMP_PRESSURE,
    );
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT, pressure }],
    };
  },
};

export default blueprint;
