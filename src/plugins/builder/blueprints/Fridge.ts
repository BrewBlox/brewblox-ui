import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const SHELF_Y_KEY = 'shelfY';
export const DEFAULT_SHELF_Y = 1;

export const MIN_SIZE: AreaSize = { width: 2, height: 4 };
export const MAX_SIZE: AreaSize = { width: 15, height: 15 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 12 };

const blueprint: BuilderBlueprint = {
  type: 'Fridge',
  title: 'Fridge',
  size: variableSizeFunc(DEFAULT_SIZE),
  transitions: () => ({}),
};

export default blueprint;
