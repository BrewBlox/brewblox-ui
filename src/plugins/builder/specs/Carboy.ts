import { PartSpec, PersistentPart } from '@/plugins/builder/types';
import { showSettingsBlock } from '@/plugins/builder/utils';
import { BlockType } from '@/plugins/spark/types';

export const DEFAULT_SIZE_X = 2;
export const DEFAULT_SIZE_Y = 4;
export const SETPOINT_KEY = 'setpoint';
export const SETPOINT_TYPES = [BlockType.SetpointSensorPair];

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
        settingsKey: SETPOINT_KEY,
        compatible: SETPOINT_TYPES,
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
  interactHandler: part => showSettingsBlock(part, SETPOINT_KEY, SETPOINT_TYPES),
};

export default spec;
