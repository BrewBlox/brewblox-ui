import { CENTER, LEFT } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const MIN_SIZE: AreaSize = { width: 1, height: 1 };
export const MAX_SIZE: AreaSize = { width: 15, height: 1 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'FilterBottom',
  title: 'Filter: bottom',
  size: variableSizeFunc(DEFAULT_SIZE),
  transitions: () => ({
    [LEFT]: [{ outCoords: CENTER }],
    [CENTER]: [{ outCoords: LEFT }],
  }),
};

export default blueprint;
