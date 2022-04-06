import { SCALE_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import { showSettingsBlock } from '@/plugins/builder/utils';
import { BlockType } from '@/plugins/spark/types';

export const SIZE_X = 2;
export const SIZE_Y = 5;
export const SETPOINT_KEY = 'setpoint';
export const SETPOINT_TYPES = [BlockType.SetpointSensorPair];

const blueprint: BuilderBlueprint = {
  type: 'Keg',
  title: 'Keg',
  transitions: () => ({}),
  cards: [
    { component: 'ColorCard' },
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: SETPOINT_KEY,
        compatible: SETPOINT_TYPES,
        label: 'Setpoint',
      },
    },
    {
      component: 'ScaleCard',
      props: {
        settingsKey: SCALE_KEY,
        defaultSize: [SIZE_X, SIZE_Y],
      },
    },
  ],
  size: ({ settings }) => {
    const scale = settings[SCALE_KEY] ?? 1;
    return [SIZE_X * scale, SIZE_Y * scale];
  },
  interactHandler: (part) =>
    showSettingsBlock(part, SETPOINT_KEY, SETPOINT_TYPES),
};

export default blueprint;
