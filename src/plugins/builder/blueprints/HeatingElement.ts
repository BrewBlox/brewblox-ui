import { BuilderBlueprint } from '@/plugins/builder/types';
import { BlockType } from 'brewblox-proto/ts';

export const PWM_KEY = 'pwm';
export const PWM_TYPES = [BlockType.ActuatorPwm, BlockType.FastPwm];

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
        settingsKey: 'sizeX',
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
  size: (part) => [part.settings.sizeX || DEFAULT_SIZE_X, SIZE_Y],
  transitions: () => ({}),
};

export default blueprint;
