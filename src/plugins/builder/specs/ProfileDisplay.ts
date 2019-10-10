import { blockTypes } from '@/plugins/spark/block-types';

import { showLinkedBlockDialog } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 2;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'ProfileDisplay',
  transitions: () => ({}),
  cards: [{
    component: 'LinkedBlockCard',
    props: {
      settingsKey: 'profile',
      types: [blockTypes.SetpointProfile],
      label: 'Setpoint Profile',
    },
  }],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: PersistentPart) => showLinkedBlockDialog(part, 'profile'),
};

export default spec;
