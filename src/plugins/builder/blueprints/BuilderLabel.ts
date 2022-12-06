import { BuilderBlueprint } from '@/plugins/builder/types';
import { SIZE_X_KEY, SIZE_Y_KEY } from '../const';
import { variableSizeFunc } from '../utils';

const DEFAULT_SIZE_X = 4;
const DEFAULT_SIZE_Y = 1;

const blueprint: BuilderBlueprint = {
  type: 'BuilderLabel',
  title: 'Label: text',
  cards: [
    {
      component: 'TextCard',
      props: {
        settingsKey: 'text',
        label: 'Displayed text',
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'fontSize',
        label: 'Font size',
        defaultSize: 16,
        min: 8,
        max: 40,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: SIZE_X_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 10,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: SIZE_Y_KEY,
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
