import { blockTypes } from '@/plugins/spark/block-types';

import { showSettingsBlock } from '../helpers';
import { PartSpec } from '../types';


const SIZE_X = 1;
const SIZE_Y = 1;
const settingsKey = 'pid';

const spec: PartSpec = {
  id: 'PidDisplay',
  title: 'Display: PID',
  transitions: () => ({}),
  cards: [{
    component: 'BlockAddressCard',
    props: {
      settingsKey,
      compatible: [blockTypes.Pid],
      label: 'PID',
    },
  }],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: part => showSettingsBlock(part, settingsKey),
};

export default spec;
