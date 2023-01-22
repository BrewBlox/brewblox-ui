import { BuilderBlueprint } from '@/plugins/builder/types';

export const WIDGET_KEY = 'widgetId';
export const WIDGET_TYPE = 'SessionLog';

export const MIN_SIZE: AreaSize = { width: 1, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 1 };
export const DEFAULT_SIZE: AreaSize = { width: 1, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'SessionLogDisplay',
  title: 'Display: Session Log',
  component: 'SessionLogDisplayPartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: () => null,
};

export default blueprint;
