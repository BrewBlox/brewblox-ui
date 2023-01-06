import { FLOW_TOGGLE_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import {
  universalTransitions,
  variableSizeFunc,
} from '@/plugins/builder/utils';

export const MIN_SIZE: AreaSize = { width: 1, height: 1 };
export const MAX_SIZE: AreaSize = { width: 5, height: 5 };
export const DEFAULT_SIZE: AreaSize = { width: 1, height: 1 };

const size = variableSizeFunc(DEFAULT_SIZE);

const blueprint: BuilderBlueprint = {
  type: 'SensorDisplay',
  title: 'Display: Temp Sensor',
  size,
  transitions: (part) =>
    universalTransitions(size(part), part.settings[FLOW_TOGGLE_KEY]),
};

export default blueprint;
