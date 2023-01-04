import { BuilderBlueprint } from '@/plugins/builder/types';
import { HEIGHT_KEY, LABEL_KEY, WIDTH_KEY } from '../const';
import { variableSizeFunc } from '../utils';

export const DEFAULT_SIZE_X = 4;
export const DEFAULT_SIZE_Y = 1;

export const LABEL_FONT_SIZE_KEY = 'fontSize';
export const LABEL_FONT_SIZE_DEFAULT = 16;

const blueprint: BuilderBlueprint = {
  type: 'BuilderLabel',
  title: 'Label: text',
  cards: [
    {
      component: 'TextCard',
      props: {
        settingsKey: LABEL_KEY,
        label: 'Displayed text',
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: LABEL_FONT_SIZE_KEY,
        label: 'Font size',
        defaultSize: LABEL_FONT_SIZE_DEFAULT,
        min: 8,
        max: 40,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: WIDTH_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 10,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: HEIGHT_KEY,
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 1,
        max: 10,
      },
    },
  ],
  size: variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y),
  transitions: () => ({}),
};

export default blueprint;
