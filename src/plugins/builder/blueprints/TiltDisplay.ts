import { BuilderBlueprint } from '@/plugins/builder/types';
import { passthroughTransitions } from '@/plugins/builder/utils';

export const DEFAULT_SIZE_X = 2;
export const DEFAULT_SIZE_Y = 1;
export const TILT_ID_KEY = 'tiltId';

export const MIN_SIZE: AreaSize = { width: 1, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 5 };
export const DEFAULT_SIZE: AreaSize = { width: 2, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'TiltDisplay',
  title: 'Display: Tilt',
  component: 'TiltDisplayPartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: (part) => passthroughTransitions(part),
};

export default blueprint;
