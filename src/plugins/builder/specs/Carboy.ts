import { showBlockDialog } from '@/helpers/dialog';
import { typeName as setpointType } from '@/plugins/spark/features/SetpointSensorPair/getters';

import { settingsBlock } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 2;
const SIZE_Y = 4;

const spec: PartSpec = {
  id: 'Carboy',
  transitions: () => ({}),
  cards: [
    {
      component: 'LinkedBlockCard',
      props: {
        settingsKey: 'setpoint',
        types: [setpointType],
        label: 'Setpoint',
      },
    },
    {
      component: 'ColorCard',
    },
  ],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: PersistentPart) => showBlockDialog(settingsBlock(part, 'setpoint')),
};

export default spec;
