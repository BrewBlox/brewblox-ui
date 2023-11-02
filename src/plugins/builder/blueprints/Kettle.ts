import { COLOR_KEY } from '../const';
import { BuilderBlueprint, BuilderPart } from '@/plugins/builder/types';
import { containerTransitions } from '@/plugins/builder/utils';

export const KETTLE_FILL_PCT_KEY = 'fillPct';
export const DEFAULT_KETTLE_FILL_PCT = 85;

export const MIN_SIZE: AreaSize = { width: 2, height: 2 };
export const MAX_SIZE: AreaSize = { width: 10, height: 10 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 6 };

const blueprint: BuilderBlueprint = {
  type: 'Kettle',
  title: 'Kettle',
  component: 'KettlePartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: (part: BuilderPart) =>
    containerTransitions(part, part.settings[COLOR_KEY]),
};

export default blueprint;
