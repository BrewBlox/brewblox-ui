import { showBlockDialog } from '@/helpers/dialog';
import { typeName as setpointType } from '@/plugins/spark/features/SetpointSensorPair/getters';

import { defaultSpec } from '../getters';
import { settingsBlock } from '../helpers';
import { ComponentSpec, StatePart } from '../types';

const SIZE_X = 2;
const SIZE_Y = 5;

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [
    { component: 'ColorCard' },
    {
      component: 'LinkedBlockCard',
      props: {
        settingsKey: 'setpoint',
        types: [setpointType],
        label: 'Setpoint',
      },
    },
  ],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: StatePart) => showBlockDialog(settingsBlock(part, 'setpoint')),
};

export default spec;
