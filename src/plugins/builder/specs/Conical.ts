import { PartSpec } from '@/plugins/builder/types';
import { showSettingsBlock } from '@/plugins/builder/utils';
import { BlockType } from '@/plugins/spark/types';

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
        compatible: [BlockType.SetpointSensorPair],
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
