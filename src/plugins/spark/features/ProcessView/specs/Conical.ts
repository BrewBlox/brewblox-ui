import { showBlockDialog } from '@/helpers/dialog';
import { typeName as setpointType } from '@/plugins/spark/features/SetpointSensorPair/getters';

import { defaultSpec } from '../getters';
import { settingsBlock } from '../helpers';
import { ComponentSpec, StatePart } from '../types';

const SIZE_X = 3;
const SIZE_Y = 9;

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [
    {
      component: 'LinkedBlockCard',
      props: {
        settingsKey: 'setpoint',
        typeName: setpointType,
        label: 'Setpoint',
      },
    },
  ],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: StatePart) => showBlockDialog(settingsBlock(part, 'setpoint')),
};

export default spec;
