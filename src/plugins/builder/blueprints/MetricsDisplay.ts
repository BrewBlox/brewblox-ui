import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import { universalTransitions } from '@/plugins/builder/utils';

export const DEFAULT_SIZE_X = 4;
export const DEFAULT_SIZE_Y = 2;
export const FLOW_TOGGLE_KEY = 'flowEnabled';
export const FLEX_ROW_KEY = 'flexRow';

const size = (part: PersistentPart): [number, number] => [
  part.settings.sizeX || DEFAULT_SIZE_X,
  part.settings.sizeY || DEFAULT_SIZE_Y,
];

const blueprint: BuilderBlueprint = {
  type: 'MetricsDisplay',
  title: 'Display: Metrics',
  cards: [
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 10,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeY',
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 1,
        max: 10,
      },
    },
    {
      component: 'ToggleCard',
      props: {
        settingsKey: FLOW_TOGGLE_KEY,
        label: 'Allow liquid to flow through this part',
      },
    },
    {
      component: 'ToggleCard',
      props: {
        settingsKey: FLEX_ROW_KEY,
        label: 'Use horizontal layout',
      },
    },
    {
      component: 'BorderCard',
    },
    {
      component: 'MetricsCard',
    },
  ],
  size,
  transitions: (part) =>
    universalTransitions(size(part), part.settings[FLOW_TOGGLE_KEY]),
};

export default blueprint;
