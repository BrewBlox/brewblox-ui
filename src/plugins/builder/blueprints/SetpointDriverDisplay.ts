import { FLOW_TOGGLE_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import { passthroughTransitions } from '@/plugins/builder/utils';

export const MIN_SIZE: AreaSize = { width: 1, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 5 };
export const DEFAULT_SIZE: AreaSize = { width: 2, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'SetpointDriverDisplay',
  title: 'Display: Setpoint Driver',
  component: 'SetpointDriverDisplayPartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: (part) =>
    passthroughTransitions(part, part.settings[FLOW_TOGGLE_KEY]),
};

export default blueprint;
