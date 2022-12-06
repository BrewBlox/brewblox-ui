import { BuilderBlueprint } from '@/plugins/builder/types';
import { SIZE_X_KEY, SIZE_Y_KEY } from '../const';
import { variableSizeFunc } from '../utils';

const DEFAULT_SIZE_X = 4;
const DEFAULT_SIZE_Y = 12;

const blueprint: BuilderBlueprint = {
  type: 'Fridge',
  title: 'Fridge',
  cards: [
    {
      component: 'TextCard',
      props: {
        settingsKey: 'text',
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'shelfY',
        defaultSize: 1,
        label: 'Shelf position (from top)',
        min: 1,
        max: 14,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: SIZE_X_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 4,
        max: 15,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: SIZE_Y_KEY,
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 4,
        max: 15,
      },
    },
  ],
  size: variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y),
  transitions: () => ({}),
};

export default blueprint;
