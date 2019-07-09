import { DOWN, LEFT, RIGHT, UP, defaultSpec } from '../getters';
import { ComponentSpec } from '../types';

const SIZE_X = 1;
const SIZE_Y = 1;

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'sensor', types: ['TempSensorInterface'], label: 'Sensor' },
  }],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }, { outCoords: LEFT }, { outCoords: DOWN }],
    [RIGHT]: [{ outCoords: UP }, { outCoords: LEFT }, { outCoords: DOWN }],
    [LEFT]: [{ outCoords: UP }, { outCoords: RIGHT }, { outCoords: DOWN }],
    [DOWN]: [{ outCoords: UP }, { outCoords: LEFT }, { outCoords: RIGHT }],
  }),
};

export default spec;
