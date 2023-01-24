import { BuilderBlueprint } from '@/plugins/builder/types';

export const MIN_SIZE: AreaSize = { width: 6, height: 6 };
export const MAX_SIZE: AreaSize = { width: 40, height: 40 };
export const DEFAULT_SIZE: AreaSize = { width: 10, height: 6 };

const blueprint: BuilderBlueprint = {
  type: 'GraphDisplay',
  title: 'Display: Graph',
  component: 'GraphDisplayPartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: () => null,
};

export default blueprint;
