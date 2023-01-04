import { BuilderBlueprint } from '@/plugins/builder/types';
import { PWM_KEY, PWM_TYPES, WIDTH_KEY } from '../const';
import { variableSizeFunc } from '../utils';

export const DEFAULT_SIZE_X = 5;
export const DEFAULT_SIZE_Y = 1;

const blueprint: BuilderBlueprint = {
  type: 'HeatingElement',
  title: 'Heating element',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: PWM_KEY,
        compatible: PWM_TYPES,
        label: 'PWM',
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: WIDTH_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 3,
        max: 10,
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
