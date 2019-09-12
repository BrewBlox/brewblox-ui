
import { showBlockDialog } from '@/helpers/dialog';
import { typeName } from '@/plugins/spark/features/SetpointProfile/getters';

import { settingsBlock } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 2;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'ProfileDisplay',
  transitions: () => ({}),
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'profile', types: [typeName], label: 'Setpoint Profile' },
  }],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: PersistentPart) => showBlockDialog(settingsBlock(part, 'profile')),
};

export default spec;
