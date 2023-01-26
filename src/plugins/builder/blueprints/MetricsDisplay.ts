import { BuilderBlueprint } from '@/plugins/builder/types';
import { passthroughTransitions } from '@/plugins/builder/utils';

export const MIN_SIZE: AreaSize = { width: 2, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 10 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 2 };

const blueprint: BuilderBlueprint = {
  type: 'MetricsDisplay',
  title: 'Display: Metrics',
  component: 'MetricsDisplayPartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: (part) => passthroughTransitions(part),
};

export default blueprint;
