import {
  BuilderBlueprint,
  BuilderPart,
  PartTransitions,
} from '@/plugins/builder/types';
import { Coordinates } from '@/utils/coordinates';

export const ENTRY = '1.5,0,0';

export const MIN_SIZE: AreaSize = { width: 3, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 1 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'RimsTube',
  title: 'RIMS',
  component: 'RimsTubePartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: (part: BuilderPart): PartTransitions => {
    const rightOut = new Coordinates([part.width - 0.5, 0, 0]).toString();
    return {
      [ENTRY]: [{ outCoords: rightOut, friction: part.width - 1 }],
      [rightOut]: [{ outCoords: ENTRY, friction: part.width - 1 }],
    };
  },
};

export default blueprint;
