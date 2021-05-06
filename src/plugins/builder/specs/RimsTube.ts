import { PartSpec, PersistentPart, Transitions } from '@/plugins/builder/types';
import { showDrivingBlockDialog } from '@/plugins/builder/utils';
import { BlockType } from '@/plugins/spark/types';
import { Coordinates } from '@/utils/coordinates';

export const DEFAULT_SIZE_X = 4;
export const SIZE_Y = 1;
export const ENTRY = '1.5,0,0';
export const PWM_KEY = 'pwm';
export const PWM_TYPES = [BlockType.ActuatorPwm];

const spec: PartSpec = {
  id: 'RimsTube',
  title: 'RIMS',
  cards: [
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 10,
      },
    },
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: PWM_KEY,
        compatible: PWM_TYPES,
        label: 'PWM',
      },
    },
    {
      component: 'BorderCard',
    },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    SIZE_Y,
  ],
  transitions: (part: PersistentPart): Transitions => {
    const sizeX = part.settings.sizeX || DEFAULT_SIZE_X;
    const rightOut = new Coordinates([sizeX - 0.5, 0, 0]).toString();
    return {
      [ENTRY]: [{ outCoords: rightOut, friction: sizeX - 1 }],
      [rightOut]: [{ outCoords: ENTRY, friction: sizeX - 1 }],
    };
  },
  interactHandler: (part: PersistentPart) => showDrivingBlockDialog(part, PWM_KEY, PWM_TYPES),
};

export default spec;
