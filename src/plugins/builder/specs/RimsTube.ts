import { Coordinates } from '@/helpers/coordinates';
import { BlockType } from '@/plugins/spark/types';

import { showDrivingBlockDialog } from '../helpers';
import { PartSpec, PersistentPart, Transitions } from '../types';

const DEFAULT_SIZE_X = 4;
const SIZE_Y = 1;
const ENTRY = '1.5,0,0';

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
        settingsKey: 'pwm',
        compatible: [BlockType.ActuatorPwm],
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
  interactHandler: (part: PersistentPart) => showDrivingBlockDialog(part, 'pwm'),
};

export default spec;
