import { BuilderBlueprint } from '@/plugins/builder/types';

export const MIN_SIZE: AreaSize = { width: 3, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 1 };
export const DEFAULT_SIZE: AreaSize = { width: 5, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'HeatingElement',
  title: 'Heating element',
  component: 'HeatingElementPartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: () => null,
};

export default blueprint;
