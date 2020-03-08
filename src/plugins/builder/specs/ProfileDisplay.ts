import { blockTypes } from '@/plugins/spark/block-types';

import { showSettingsBlock } from '../helpers';
import { PartSpec } from '../types';

const SIZE_X = 2;
const SIZE_Y = 1;
const settingsKey = 'profile';

const spec: PartSpec = {
  id: 'ProfileDisplay',
  title: 'Display: setpoint profile',
  transitions: () => ({}),
  cards: [{
    component: 'BlockAddressCard',
    props: {
      settingsKey,
      compatible: [blockTypes.SetpointProfile],
      label: 'Setpoint Profile',
    },
  }],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: part => showSettingsBlock(part, settingsKey),
};

export default spec;
