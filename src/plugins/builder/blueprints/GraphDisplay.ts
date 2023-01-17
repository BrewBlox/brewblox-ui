import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '@/plugins/builder/utils';

export const MIN_SIZE: AreaSize = { width: 6, height: 6 };
export const MAX_SIZE: AreaSize = { width: 40, height: 40 };
export const DEFAULT_SIZE: AreaSize = { width: 10, height: 6 };

const size = variableSizeFunc(DEFAULT_SIZE);

const blueprint: BuilderBlueprint = {
  type: 'GraphDisplay',
  title: 'Display: Graph',
  size,
  transitions: () => ({}),
};

export default blueprint;
