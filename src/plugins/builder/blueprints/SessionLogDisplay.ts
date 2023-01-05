import { BuilderBlueprint } from '@/plugins/builder/types';
import { WIDTH_KEY } from '../const';
import { variableSizeFunc } from '../utils';

export const WIDGET_KEY = 'widgetId';
export const WIDGET_TYPE = 'SessionLog';

export const DEFAULT_SIZE_X = 1;
export const DEFAULT_SIZE_Y = 1;

export const MIN_SIZE: AreaSize = { width: 1, height: 1 };
export const MAX_SIZE: AreaSize = { width: 10, height: 1 };
export const DEFAULT_SIZE: AreaSize = { width: 1, height: 1 };

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
        types: [WIDGET_TYPE],
      },
    },
    {
      component: 'BorderCard',
      props: {},
    },
  ],
  size: variableSizeFunc(DEFAULT_SIZE),
  transitions: () => ({}),
};

export default blueprint;
