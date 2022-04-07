import { SCALE_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import {
  showSettingsBlock,
  universalTransitions,
} from '@/plugins/builder/utils';
import {
  BlockIntfType,
  TempSensorMockBlock,
  TempSensorOneWireBlock,
} from '@/plugins/spark/types';

export type SensorT = TempSensorMockBlock | TempSensorOneWireBlock;
export const SIZE_X = 1;
export const SIZE_Y = 1;
export const SENSOR_KEY = 'sensor';
export const SENSOR_TYPES = [BlockIntfType.TempSensorInterface];
export const FLOW_TOGGLE_KEY = 'flowEnabled';

const size: BuilderBlueprint['size'] = ({ settings }) => {
  const scale = settings[SCALE_KEY] ?? 1;
  return [SIZE_X * scale, SIZE_Y * scale];
};

const blueprint: BuilderBlueprint = {
  type: 'SensorDisplay',
  title: 'Display: sensor',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: SENSOR_KEY,
        compatible: SENSOR_TYPES,
        label: 'Sensor',
      },
    },
    {
      component: 'ScaleCard',
      props: {
        settingsKey: SCALE_KEY,
        defaultSize: [SIZE_X, SIZE_Y],
      },
    },
    {
      component: 'ToggleCard',
      props: {
        settingsKey: FLOW_TOGGLE_KEY,
        label: 'Allow liquid to flow through this part',
      },
    },
    {
      component: 'BorderCard',
    },
  ],
  size,
  transitions: (part) =>
    universalTransitions(size(part), part.settings[FLOW_TOGGLE_KEY]),
  interactHandler: (part) => showSettingsBlock(part, SENSOR_KEY, SENSOR_TYPES),
};

export default blueprint;
