import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import {
  containerTransitions,
  variableSizeFunc,
} from '@/plugins/builder/utils';
import { COLOR_KEY } from '../const';

export const KETTLE_FILL_PCT_KEY = 'fillPct';
export const DEFAULT_KETTLE_FILL_PCT = 85;

export const MIN_SIZE: AreaSize = { width: 2, height: 2 };
export const MAX_SIZE: AreaSize = { width: 10, height: 10 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 6 };

const size = variableSizeFunc(DEFAULT_SIZE);

const blueprint: BuilderBlueprint = {
  type: 'Kettle',
  title: 'Kettle',
  size,
  transitions: (part: PersistentPart) =>
    containerTransitions(size(part), part.settings[COLOR_KEY]),
};

export default blueprint;
