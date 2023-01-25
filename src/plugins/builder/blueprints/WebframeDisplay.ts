import { BuilderBlueprint } from '@/plugins/builder/types';

export const WEBFRAME_SCALE_KEY = 'webframeScale';

export const MIN_SIZE: AreaSize = { width: 2, height: 2 };
export const MAX_SIZE: AreaSize = { width: 20, height: 20 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 6 };

const blueprint: BuilderBlueprint = {
  type: 'WebframeDisplay',
  title: 'Display: iframe',
  component: 'WebframeDisplayPartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: () => null,
};

export default blueprint;
