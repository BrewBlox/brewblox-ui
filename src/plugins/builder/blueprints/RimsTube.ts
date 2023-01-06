import {
  BuilderBlueprint,
  PersistentPart,
  Transitions,
} from '@/plugins/builder/types';
import { Coordinates } from '@/utils/coordinates';
import { variableSizeFunc } from '../utils';

export const ENTRY = '1.5,0,0';

export const MIN_SIZE: AreaSize = { width: 3, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 1 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 1 };

const size = variableSizeFunc(DEFAULT_SIZE);

const blueprint: BuilderBlueprint = {
  type: 'RimsTube',
  title: 'RIMS',
  size,
  transitions: (part: PersistentPart): Transitions => {
    const [width] = size(part);
    const rightOut = new Coordinates([width - 0.5, 0, 0]).toString();
    return {
      [ENTRY]: [{ outCoords: rightOut, friction: width - 1 }],
      [rightOut]: [{ outCoords: ENTRY, friction: width - 1 }],
    };
  },
};

export default blueprint;
