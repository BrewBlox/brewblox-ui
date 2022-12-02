import { SCALE_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import { universalTransitions } from '@/plugins/builder/utils';
import { BlockType } from 'brewblox-proto/ts';

export const SIZE_X = 2;
export const SIZE_Y = 1;
export const PROFILE_KEY = 'profile';
export const PROFILE_TYPES = [BlockType.SetpointProfile];
export const FLOW_TOGGLE_KEY = 'flowEnabled';

const size: BuilderBlueprint['size'] = ({ settings }) => {
  const scale = settings[SCALE_KEY] ?? 1;
  return [SIZE_X * scale, SIZE_Y * scale];
};

const blueprint: BuilderBlueprint = {
  type: 'ProfileDisplay',
  title: 'Display: setpoint profile',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: PROFILE_KEY,
        compatible: PROFILE_TYPES,
        label: 'Setpoint Profile',
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
};

export default blueprint;
