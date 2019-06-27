import { typeName as pwmType } from '@/plugins/spark/features/ActuatorPwm/getters';

import { defaultSpec } from '../getters';
import { ComponentSpec, PersistentPart } from '../types';

const DEFAULT_SIZE_X = 4;
const DEFAULT_SIZE_Y = 12;

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [
    { component: 'TextCard' },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 4,
        max: 15,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeY',
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 4,
        max: 15,
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
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    part.settings.sizeY || DEFAULT_SIZE_Y,
  ],
  transitions: () => ({}),
};

export default spec;
