import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const MIN_SIZE: AreaSize = { width: 3, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 1 };
export const DEFAULT_SIZE: AreaSize = { width: 5, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'HeatingElement',
  title: 'Heating element',
  size: variableSizeFunc(DEFAULT_SIZE),
  transitions: () => ({}),
};

export default blueprint;
