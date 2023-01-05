import { BuilderBlueprint } from '@/plugins/builder/types';
import { HEIGHT_KEY, LABEL_KEY, WIDTH_KEY } from '../const';
import { variableSizeFunc } from '../utils';

export const DEFAULT_SIZE_X = 4;
export const DEFAULT_SIZE_Y = 12;
export const SHELF_Y_KEY = 'shelfY';
export const DEFAULT_SHELF_Y = 1;

export const MIN_SIZE: AreaSize = { width: 2, height: 4 };
export const MAX_SIZE: AreaSize = { width: 15, height: 15 };
export const DEFAULT_SIZE: AreaSize = { width: 4, height: 12 };

const blueprint: BuilderBlueprint = {
  type: 'Fridge',
  title: 'Fridge',
  cards: [
    {
      component: 'TextCard',
      props: {
        settingsKey: LABEL_KEY,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: SHELF_Y_KEY,
        defaultSize: DEFAULT_SHELF_Y,
        label: 'Shelf position (from top)',
        min: 1,
        max: 14,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: WIDTH_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 15,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: HEIGHT_KEY,
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 4,
        max: 15,
      },
    },
  ],
  size: variableSizeFunc(DEFAULT_SIZE),
  transitions: () => ({}),
};

export default blueprint;
