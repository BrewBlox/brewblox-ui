import { blockTypes } from '@/plugins/spark/block-types';

import { showLinkedBlockDialog } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 3;
const SIZE_Y = 9;

const spec: PartSpec = {
  id: 'Conical',
  transitions: () => ({}),
  cards: [
    {
      component: 'LinkedBlockCard',
      props: {
        settingsKey: 'setpoint',
        types: [blockTypes.SetpointSensorPair],
        label: 'Setpoint',
      },
    },
  ],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: PersistentPart) => showLinkedBlockDialog(part, 'setpoint'),
};

export default spec;
