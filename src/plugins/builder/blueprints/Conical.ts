import { SCALE_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import { BlockType } from 'brewblox-proto/ts';

export const SETPOINT_KEY = 'setpoint';
export const SETPOINT_TYPES = [BlockType.SetpointSensorPair];

const SIZE_X = 3;
const SIZE_Y = 9;

const blueprint: BuilderBlueprint = {
  type: 'Conical',
  title: 'Conical',
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
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: SIZE_X,
        label: 'Width',
        min: 2,
        max: 8,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeY',
        defaultSize: SIZE_Y,
        label: 'Height',
        min: 2,
        max: 20,
      },
    },
  ],
  size: ({ settings }) => {
    if (settings.sizeX !== undefined || settings.sizeY !== undefined) {
      return [settings.sizeX || SIZE_X, settings.sizeY || SIZE_Y];
    }
    // backwards compatibility with deprecated setting
    if (settings[SCALE_KEY] !== undefined) {
      const scale = settings[SCALE_KEY] ?? 1;
      return [SIZE_X * scale, SIZE_Y * scale];
    }
    return [SIZE_X, SIZE_Y];
  },
};

export default blueprint;
