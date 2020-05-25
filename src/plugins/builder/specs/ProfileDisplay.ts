import { blockTypes } from '@/plugins/spark/block-types';

import { showSettingsBlock, universalTransitions } from '../helpers';
import { PartSpec } from '../types';

const SIZE_X = 2;
const SIZE_Y = 1;
const addressKey = 'profile';
const scaleKey = 'scale';
const flowEnabledKey = 'flowEnabled';

const size: PartSpec['size'] = ({ settings }) => {
  const scale = settings[scaleKey] ?? 1;
  return [SIZE_X * scale, SIZE_Y * scale];
};

const spec: PartSpec = {
  id: 'ProfileDisplay',
  title: 'Display: setpoint profile',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        addressKey,
        compatible: [blockTypes.SetpointProfile],
        label: 'Setpoint Profile',
      },
    },
    {
      component: 'ScaleCard',
      props: {
        settingsKey: scaleKey,
        defaultSize: [SIZE_X, SIZE_Y],
      },
    },
    {
      component: 'ToggleCard',
      props: {
        settingsKey: flowEnabledKey,
        label: 'Allow liquid to flow through this part',
      },
    },
  ],
  size,
  transitions: part => universalTransitions(size(part), part.settings[flowEnabledKey]),
  interactHandler: part => showSettingsBlock(part, addressKey),
};

export default spec;
