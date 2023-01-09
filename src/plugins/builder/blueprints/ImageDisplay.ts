import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const MIN_SIZE: AreaSize = { width: 1, height: 1 };
export const MAX_SIZE: AreaSize = { width: 20, height: 20 };
export const DEFAULT_SIZE: AreaSize = { width: 3, height: 2 };

const blueprint: BuilderBlueprint = {
  type: 'ImageDisplay',
  title: 'Display: Image',
  size: variableSizeFunc(DEFAULT_SIZE),
  transitions: () => ({}),
};

export default blueprint;
