import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const MIN_SIZE: AreaSize = { width: 2, height: 2 };
export const MAX_SIZE: AreaSize = { width: 8, height: 20 };
export const DEFAULT_SIZE: AreaSize = { width: 3, height: 9 };

const blueprint: BuilderBlueprint = {
  type: 'Conical',
  title: 'Conical',
  transitions: () => ({}),
  size: variableSizeFunc(DEFAULT_SIZE),
};

export default blueprint;
