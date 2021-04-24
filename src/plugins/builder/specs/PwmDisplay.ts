import { PartSpec } from '@/plugins/builder/types';
import { showDrivingBlockDialog, universalTransitions } from '@/plugins/builder/utils';
import { BlockType } from '@/plugins/spark/types';

export const SIZE_X = 1;
export const SIZE_Y = 1;
export const PWM_KEY = 'pwm';
export const PWM_TYPES = [BlockType.ActuatorPwm];
export const SCALE_KEY = 'scale';
export const FLOW_TOGGLE_KEY = 'flowEnabled';

const size: PartSpec['size'] = ({ settings }) => {
  const scale = settings[SCALE_KEY] ?? 1;
  return [SIZE_X * scale, SIZE_Y * scale];
};

const spec: PartSpec = {
  id: 'PwmDisplay',
  title: 'Display: PWM',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: PWM_KEY,
        compatible: PWM_TYPES,
        label: 'PWM',
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
  interactHandler: part => showDrivingBlockDialog(part, PWM_KEY, PWM_TYPES),
};

export default spec;
