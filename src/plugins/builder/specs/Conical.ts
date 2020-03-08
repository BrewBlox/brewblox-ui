import { blockTypes } from '@/plugins/spark/block-types';

import { showSettingsBlock } from '../helpers';
import { PartSpec } from '../types';

const SIZE_X = 3;
const SIZE_Y = 9;
const settingsKey = 'setpoint';

const spec: PartSpec = {
  id: 'Conical',
  title: 'Conical',
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
  ],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: part => showSettingsBlock(part, settingsKey),
};

export default spec;
