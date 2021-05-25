import { SCALE_KEY } from '@/plugins/builder/const';
import { PartSpec } from '@/plugins/builder/types';
import { showSettingsBlock, universalTransitions } from '@/plugins/builder/utils';
import { BlockType } from '@/plugins/spark/types';


export const SIZE_X = 2;
export const SIZE_Y = 1;
export const DRIVER_KEY = 'setpointDriver';
export const DRIVER_TYPES = [BlockType.ActuatorOffset];
export const FLOW_TOGGLE_KEY = 'flowEnabled';

const size: PartSpec['size'] = ({ settings }) => {
  const scale = settings[SCALE_KEY] ?? 1;
  return [SIZE_X * scale, SIZE_Y * scale];
};

const spec: PartSpec = {
  id: 'SetpointDriverDisplay',
  title: 'Display: setpoint driver',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: DRIVER_KEY,
        compatible: DRIVER_TYPES,
        label: 'Setpoint Driver',
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
  interactHandler: part => showSettingsBlock(part, DRIVER_KEY, DRIVER_TYPES),
};

export default spec;
