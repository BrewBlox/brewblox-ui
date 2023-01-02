import { BuilderBlueprint } from '@/plugins/builder/types';
import {
  universalTransitions,
  variableSizeFunc,
} from '@/plugins/builder/utils';
import { FLOW_TOGGLE_KEY, HEIGHT_KEY, WIDTH_KEY } from '../const';

export const DEFAULT_SIZE_X = 4;
export const DEFAULT_SIZE_Y = 2;

const size = variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y);

const blueprint: BuilderBlueprint = {
  type: 'MetricsDisplay',
  title: 'Display: Metrics',
  cards: [
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
    {
      component: 'ToggleCard',
      props: {
        settingsKey: FLOW_TOGGLE_KEY,
        label: 'Allow liquid to flow through this part',
      },
    },
    {
      component: 'BorderCard',
      props: {},
    },
    {
      component: 'MetricsCard',
      props: {},
    },
  ],
  size,
  transitions: (part) =>
    universalTransitions(size(part), part.settings[FLOW_TOGGLE_KEY]),
};

export default blueprint;
