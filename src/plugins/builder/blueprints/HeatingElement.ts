import { BuilderBlueprint } from '@/plugins/builder/types';
import { PWM_KEY, PWM_TYPES, SIZE_X_KEY } from '../const';
import { variableSizeFunc } from '../utils';

const DEFAULT_SIZE_X = 5;
const SIZE_Y = 1;

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
        settingsKey: SIZE_X_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 3,
        max: 10,
      },
    },
    {
      component: 'BorderCard',
    },
  ],
  size: variableSizeFunc(DEFAULT_SIZE_X, SIZE_Y),
  transitions: () => ({}),
};

export default blueprint;
