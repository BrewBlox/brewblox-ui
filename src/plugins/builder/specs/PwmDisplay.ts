import { showBlockDialog } from '@/helpers/dialog';
import { typeName } from '@/plugins/spark/features/ActuatorPwm/getters';

import { settingsBlock } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 1;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'PwmDisplay',
  transitions: () => ({}),
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'pwm', types: [typeName], label: 'PWM' },
  }],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: PersistentPart) => showBlockDialog(settingsBlock(part, 'pwm')),
};

export default spec;
