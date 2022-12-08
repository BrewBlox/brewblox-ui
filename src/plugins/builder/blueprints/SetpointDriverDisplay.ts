import {
  DRIVER_KEY,
  DRIVER_TYPES,
  FLOW_TOGGLE_KEY,
  SIZE_X_KEY,
  SIZE_Y_KEY,
} from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import {
  universalTransitions,
  variableSizeFunc,
} from '@/plugins/builder/utils';

export const DEFAULT_SIZE_X = 2;
export const DEFAULT_SIZE_Y = 1;

const size = variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y);

const blueprint: BuilderBlueprint = {
  type: 'SetpointDriverDisplay',
  title: 'Display: Setpoint Driver',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: DRIVER_KEY,
        compatible: DRIVER_TYPES,
        label: 'Setpoint Driver',
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: SIZE_X_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 1,
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
