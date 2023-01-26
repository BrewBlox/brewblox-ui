import { BuilderBlueprint } from '@/plugins/builder/types';

export const LABEL_FONT_SIZE_KEY = 'fontSize';
export const LABEL_FONT_SIZE_DEFAULT = 16;

export const MIN_SIZE: AreaSize = { width: 2, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 10 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'BuilderLabel',
  title: 'Label: text',
  component: 'BuilderLabelPartComponent',
  defaultSize: DEFAULT_SIZE,
  transitions: () => null,
};

export default blueprint;
