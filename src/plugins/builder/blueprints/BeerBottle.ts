import { COLOR_KEY, SIZE_X_KEY, SIZE_Y_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const DEFAULT_SIZE_X = 1;
export const DEFAULT_SIZE_Y = 2;

const blueprint: BuilderBlueprint = {
  type: 'BeerBottle',
  title: 'Beer bottle',
  cards: [
    {
      component: 'ColorCard',
      props: {
        settingsKey: COLOR_KEY,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: SIZE_X_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 1,
        max: 5,
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
