import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const MIN_SIZE: AreaSize = { width: 2, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 10 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'UrlDisplay',
  title: 'Label: URL',
  size: variableSizeFunc(DEFAULT_SIZE),
  transitions: () => ({}),
};

export default blueprint;
