import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const WIDGET_KEY = 'widgetId';
export const WIDGET_TYPE = 'SessionLog';

export const MIN_SIZE: AreaSize = { width: 1, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 1 };
export const DEFAULT_SIZE: AreaSize = { width: 1, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'SessionLogDisplay',
  title: 'Display: Session Log',
  size: variableSizeFunc(DEFAULT_SIZE),
  transitions: () => ({}),
};

export default blueprint;
