import { blockTypes } from '@/plugins/spark/block-types';

import { showSettingsBlock } from '../helpers';
import { PartSpec } from '../types';

const SIZE_X = 3;
const SIZE_Y = 9;
const addressKey = 'setpoint';
const scaleKey = 'scale';

const spec: PartSpec = {
  id: 'Conical',
  title: 'Conical',
  transitions: () => ({}),
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: addressKey,
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
  interactHandler: part => showSettingsBlock(part, addressKey),
};

export default spec;
