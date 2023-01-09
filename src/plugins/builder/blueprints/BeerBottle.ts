import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const MIN_SIZE: AreaSize = { width: 1, height: 1 };
export const MAX_SIZE: AreaSize = { width: 5, height: 10 };
export const DEFAULT_SIZE: AreaSize = { width: 1, height: 2 };

const blueprint: BuilderBlueprint = {
  type: 'BeerBottle',
  title: 'Beer bottle',
  size: variableSizeFunc(DEFAULT_SIZE),
  transitions: () => ({}),
};

export default blueprint;
