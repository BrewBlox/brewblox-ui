import { showBlockDialog } from '@/helpers/dialog';
import { typeName as setpointType } from '@/plugins/spark/features/SetpointSensorPair/getters';

import { settingsBlock } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 2;
const SIZE_Y = 5;

const spec: PartSpec = {
  id: 'Keg',
  transitions: () => ({}),
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
  interactHandler: (part: PersistentPart) => showBlockDialog(settingsBlock(part, 'setpoint')),
};

export default spec;
