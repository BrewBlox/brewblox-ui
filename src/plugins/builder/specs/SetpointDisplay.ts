import { Coordinates } from '@/helpers/coordinates';
import { blockTypes } from '@/plugins/spark/block-types';

import { CENTER, DOWN, LEFT, RIGHT, UP } from '../getters';
import { showSettingsBlock } from '../helpers';
import { PartSpec } from '../types';


const RIGHT_RIGHT = new Coordinates(RIGHT).translate([1, 0, 0]).toString();
const RIGHT_UP = new Coordinates(UP).translate([1, 0, 0]).toString();
const RIGHT_DOWN = new Coordinates(DOWN).translate([1, 0, 0]).toString();

const SIZE_X = 2;
const SIZE_Y = 1;
const settingsKey = 'setpoint';

const spec: PartSpec = {
  id: 'SetpointDisplay',
  title: 'Display: setpoint',
  cards: [{
    component: 'BlockAddressCard',
    props: {
      settingsKey,
      compatible: [blockTypes.SetpointSensorPair],
      label: 'Setpoint',
    },
  }],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: part => showSettingsBlock(part, settingsKey),
  transitions: () => ({
    [UP]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [LEFT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [DOWN]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [RIGHT_RIGHT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [RIGHT_UP]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [RIGHT_DOWN]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [CENTER]: [
      { outCoords: UP, friction: 0.5 },
      { outCoords: LEFT, friction: 0.5 },
      { outCoords: DOWN, friction: 0.5 },
      { outCoords: RIGHT_RIGHT, friction: 0.5 },
      { outCoords: RIGHT_UP, friction: 0.5 },
      { outCoords: RIGHT_DOWN, friction: 0.5 },
    ],
  }),
};

export default spec;
