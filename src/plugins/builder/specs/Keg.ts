import { blockTypes } from '@/plugins/spark/block-types';

import { showSettingsBlock } from '../helpers';
import { PartSpec } from '../types';

const SIZE_X = 2;
const SIZE_Y = 5;
const settingsKey = 'setpoint';
const scaleKey = 'scale';

const spec: PartSpec = {
  id: 'Keg',
  title: 'Keg',
  transitions: () => ({}),
  cards: [
    { component: 'ColorCard' },
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey,
        compatible: [blockTypes.SetpointSensorPair],
        label: 'Setpoint',
      },
    },
    {
      component: 'ScaleCard',
      props: {
        settingsKey: scaleKey,
        defaultSize: [SIZE_X, SIZE_Y],
      },
    },
  ],
  size: ({ settings }) => {
    const scale = settings[scaleKey] ?? 1;
    return [SIZE_X * scale, SIZE_Y * scale];
  },
  interactHandler: part => showSettingsBlock(part, settingsKey),
};

export default spec;
