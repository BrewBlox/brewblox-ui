import {
  FLOW_TOGGLE_KEY,
  HEIGHT_KEY,
  PID_KEY,
  PID_TYPES,
  WIDTH_KEY,
} from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import {
  universalTransitions,
  variableSizeFunc,
} from '@/plugins/builder/utils';

export const DEFAULT_SIZE_X = 1;
export const DEFAULT_SIZE_Y = 1;

const size = variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y);

const blueprint: BuilderBlueprint = {
  type: 'PidDisplay',
  title: 'Display: PID',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: PID_KEY,
        compatible: PID_TYPES,
        label: 'PID',
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: WIDTH_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 1,
        max: 5,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: HEIGHT_KEY,
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 1,
        max: 5,
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
  ],
  size,
  transitions: (part) =>
    universalTransitions(size(part), part.settings[FLOW_TOGGLE_KEY]),
};

export default blueprint;
