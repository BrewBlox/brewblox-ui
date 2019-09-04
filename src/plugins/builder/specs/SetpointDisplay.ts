
import { showBlockDialog } from '@/helpers/dialog';
import { typeName } from '@/plugins/spark/features/SetpointSensorPair/getters';

import { settingsBlock } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 2;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'SetpointDisplay',
  transitions: () => ({}),
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'setpoint', types: [typeName], label: 'Setpoint' },
  }],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: PersistentPart) => showBlockDialog(settingsBlock(part, 'setpoint')),
};

export default spec;
