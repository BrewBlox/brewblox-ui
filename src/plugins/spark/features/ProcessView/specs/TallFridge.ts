import { typeName as pwmType } from '@/plugins/spark/features/ActuatorPwm/getters';
import { typeName as setpointType } from '@/plugins/spark/features/SetpointSensorPair/getters';

import { defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const SIZE_X = 4;
const SIZE_Y = 12;

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [
    { component: 'TextCard' },
    {
      component: 'LinkedBlockCard',
      props: {
        settingsKey: 'setpoint',
        typeName: setpointType,
        label: 'Setpoint',
      },
    },
    {
      component: 'LinkedBlockCard',
      props: {
        settingsKey: 'coolPwm',
        typeName: pwmType,
        label: 'Cooler PWM',
      },
    },
    {
      component: 'LinkedBlockCard',
      props: {
        settingsKey: 'heatPwm',
        typeName: pwmType,
        label: 'Heater PWM',
      },
    },
  ],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
};

export default spec;
