import { showBlockDialog } from '@/helpers/dialog';
import { typeName } from '@/plugins/spark/features/ActuatorPwm/getters';

import { settingsBlock } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const DEFAULT_SIZE_X = 5;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'HeatingElement',
  cards: [
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
      component: 'LinkedBlockCard',
      props: { settingsKey: 'pwm', types: [typeName], label: 'PWM' },
    },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    SIZE_Y,
  ],
  transitions: () => ({}),
  interactHandler: (part: PersistentPart) => showBlockDialog(settingsBlock(part, 'pwm')),
};

export default spec;
