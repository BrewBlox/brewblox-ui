import { blockTypes } from '@/plugins/spark/block-types';

import { showLinkedBlockDialog } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 1;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'PwmDisplay',
  title: 'Display: PWM',
  transitions: () => ({}),
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'pwm', types: [blockTypes.ActuatorPwm], label: 'PWM' },
  }],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: PersistentPart) => showLinkedBlockDialog(part, 'pwm'),
};

export default spec;
