import { interfaceTypes } from '@/plugins/spark/block-types';

import { CENTER, DOWN, LEFT, RIGHT, UP } from '../getters';
import { showLinkedBlockDialog } from '../helpers';
import { PartSpec } from '../types';

const SIZE_X = 1;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'SensorDisplay',
  title: 'Display: sensor',
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'sensor', types: [interfaceTypes.TempSensor], label: 'Sensor' },
  }],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [UP]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [RIGHT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [LEFT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [DOWN]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [CENTER]: [
      { outCoords: UP, friction: 0.5 },
      { outCoords: LEFT, friction: 0.5 },
      { outCoords: RIGHT, friction: 0.5 },
      { outCoords: DOWN, friction: 0.5 },
    ],
  }),
  interactHandler: part => showLinkedBlockDialog(part, 'sensor'),
};

export default spec;
