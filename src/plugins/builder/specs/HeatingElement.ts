import { blockTypes } from '@/plugins/spark/block-types';

import { showLinkedBlockDialog } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const DEFAULT_SIZE_X = 5;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'HeatingElement',
  title: 'Heating element',
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
      props: { settingsKey: 'pwm', types: [blockTypes.ActuatorPwm], label: 'PWM' },
    },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    SIZE_Y,
  ],
  transitions: () => ({}),
  interactHandler: (part: PersistentPart) => showLinkedBlockDialog(part, 'pwm'),
};

export default spec;
