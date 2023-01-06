import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const MIN_SIZE: AreaSize = { width: 2, height: 2 };
export const MAX_SIZE: AreaSize = { width: 8, height: 10 };
export const DEFAULT_SIZE: AreaSize = { width: 2, height: 4 };

const blueprint: BuilderBlueprint = {
  type: 'Carboy',
  title: 'Carboy',
  transitions: () => ({}),
  size: variableSizeFunc(DEFAULT_SIZE),
};

export default blueprint;
