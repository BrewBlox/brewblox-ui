import { blockTypes } from '@/plugins/spark/block-types';

import { showSettingsBlock } from '../helpers';
import { PartSpec } from '../types';

const SIZE_X = 2;
const SIZE_Y = 4;
const settingsKey = 'setpoint';

const spec: PartSpec = {
  id: 'Carboy',
  title: 'Carboy',
  transitions: () => ({}),
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey,
        compatible: [blockTypes.SetpointSensorPair],
        label: 'Setpoint',
      },
    },
    {
      component: 'ColorCard',
    },
  ],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: part => showSettingsBlock(part, settingsKey),
};

export default spec;
