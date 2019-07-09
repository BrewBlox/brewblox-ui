import { Coordinates, CoordinatesParam } from '@/helpers/coordinates';
import { typeName } from '@/plugins/spark/features/ActuatorPwm/getters';

import { defaultSpec } from '../getters';
import { ComponentSpec, PersistentPart } from '../types';

const BLOCKED: CoordinatesParam[] = [
  [0, 0, 0],
  [1, 0, 0],
];

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
  blockedCoordinates: (part: PersistentPart): Coordinates[] =>
    new Coordinates([part.x, part.y, 0])
      .subSquares(BLOCKED, part.rotate, [SIZE_X, SIZE_Y]),
};

export default spec;
