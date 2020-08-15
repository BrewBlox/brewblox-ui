import { BlockType } from '@/plugins/spark/types';

import { showSettingsBlock, universalTransitions } from '../helpers';
import { PartSpec } from '../types';


const SIZE_X = 2;
const SIZE_Y = 1;
const settingsKey = 'setpointDriver';
const scaleKey = 'scale';
const flowEnabledKey = 'flowEnabled';

const size: PartSpec['size'] = ({ settings }) => {
  const scale = settings[scaleKey] ?? 1;
  return [SIZE_X * scale, SIZE_Y * scale];
};

const spec: PartSpec = {
  id: 'SetpointDriverDisplay',
  title: 'Display: setpoint driver',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey,
        compatible: [BlockType.ActuatorOffset],
        label: 'Setpoint Driver',
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
  interactHandler: part => showSettingsBlock(part, settingsKey),
};

export default spec;
