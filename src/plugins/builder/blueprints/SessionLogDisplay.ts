import { BuilderBlueprint } from '@/plugins/builder/types';
import { WIDTH_KEY } from '../const';
import { variableSizeFunc } from '../utils';

export const WIDGET_KEY = 'widgetId';
export const WIDGET_TYPES = ['SessionLog'] as const;

export const DEFAULT_SIZE_X = 1;
export const DEFAULT_SIZE_Y = 1;

const blueprint: BuilderBlueprint = {
  type: 'SessionLogDisplay',
  title: 'Display: Session Log',
  cards: [
    {
      component: 'SizeCard',
      props: {
        settingsKey: WIDTH_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 1,
        max: 10,
      },
    },
    {
      component: 'LinkedWidgetCard',
      props: {
        settingsKey: WIDGET_KEY,
        types: WIDGET_TYPES,
      },
    },
    {
      component: 'BorderCard',
      props: {},
    },
  ],
  size: variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y),
  transitions: () => ({}),
};

export default blueprint;
