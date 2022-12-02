import { BuilderBlueprint } from '@/plugins/builder/types';

export const WIDGET_KEY = 'widgetId';
export const WIDGET_TYPES = ['SessionLog'];

const DEFAULT_SIZE_X = 1;
const SIZE_Y = 1;

const blueprint: BuilderBlueprint = {
  type: 'SessionLogDisplay',
  title: 'Display: Session Log',
  cards: [
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
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
    },
  ],
  size: (part) => [part.settings.sizeX || DEFAULT_SIZE_X, SIZE_Y],
  transitions: () => ({}),
};

export default blueprint;
