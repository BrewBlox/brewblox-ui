import { PartSpec } from '@/plugins/builder/types';
import { showSettingsBlock, universalTransitions } from '@/plugins/builder/utils';
import { BlockIntfType } from '@/plugins/spark/types';


export const SIZE_X = 2;
export const SIZE_Y = 1;
export const SETPOINT_KEY = 'setpoint';
export const SETPOINT_TYPES = [BlockIntfType.SetpointSensorPairInterface];
export const SCALE_KEY = 'scale';
export const FLOW_TOGGLE_KEY = 'flowEnabled';

const size: PartSpec['size'] = ({ settings }) => {
  const scale = settings[SCALE_KEY] ?? 1;
  return [SIZE_X * scale, SIZE_Y * scale];
};

const spec: PartSpec = {
  id: 'SetpointDisplay',
  title: 'Display: setpoint',
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
  transitions: part => universalTransitions(size(part), part.settings[FLOW_TOGGLE_KEY]),
  interactHandler: part => showSettingsBlock(part, SETPOINT_KEY, SETPOINT_TYPES),
};

export default spec;
