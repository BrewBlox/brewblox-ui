import { showBlockDialog } from '@/helpers/dialog';
import { typeName } from '@/plugins/spark/features/ActuatorPwm/getters';

import { defaultSpec } from '../getters';
import { settingsBlock } from '../helpers';
import { ComponentSpec, PersistentPart } from '../types';

const SIZE_X = 5;
const SIZE_Y = 1;

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'pwm', types: [typeName], label: 'PWM' },
  }],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
  interactHandler: (part: PersistentPart) => showBlockDialog(settingsBlock(part, 'pwm')),
};

export default spec;
