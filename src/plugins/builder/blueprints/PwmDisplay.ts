import { FLOW_TOGGLE_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import { passthroughTransitions } from '@/plugins/builder/utils';

export const MIN_SIZE: AreaSize = { width: 1, height: 1 };
export const MAX_SIZE: AreaSize = { width: 5, height: 5 };
export const DEFAULT_SIZE: AreaSize = { width: 1, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'PwmDisplay',
  title: 'Display: PWM',
  component: 'PwmDisplayPartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: (part) =>
    passthroughTransitions(part, part.settings[FLOW_TOGGLE_KEY]),
};

export default blueprint;
