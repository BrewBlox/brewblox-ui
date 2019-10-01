import { blockTypes } from '@/plugins/spark/block-types';

import { showLinkedBlockDialog } from '../helpers';
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
        types: [blockTypes.SetpointSensorPair],
        label: 'Setpoint',
      },
    },
    {
      component: 'ColorCard',
    },
  ],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: PersistentPart) => showLinkedBlockDialog(part, 'setpoint'),
};

export default spec;
