import { BlockType } from '@/plugins/spark/types';

import { showSettingsBlock } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

export const DEFAULT_SIZE_X = 2;
export const DEFAULT_SIZE_Y = 4;
const settingsKey = 'setpoint';

const size = (part: PersistentPart): [number, number] => [
  part.settings.sizeX || DEFAULT_SIZE_X,
  part.settings.sizeY || DEFAULT_SIZE_Y,
];

const spec: PartSpec = {
  id: 'Carboy',
  title: 'Carboy',
  transitions: () => ({}),
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey,
        compatible: [BlockType.SetpointSensorPair],
        label: 'Setpoint',
      },
    },
    {
      component: 'ColorCard',
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 8,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeY',
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 2,
        max: 10,
      },
    },
  ],
  size,
  interactHandler: part => showSettingsBlock(part, settingsKey),
};

export default spec;
