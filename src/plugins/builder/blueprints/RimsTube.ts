import {
  BuilderBlueprint,
  PersistentPart,
  Transitions,
} from '@/plugins/builder/types';
import { Coordinates } from '@/utils/coordinates';
import { PWM_KEY, PWM_TYPES, WIDTH_KEY } from '../const';
import { variableSizeFunc } from '../utils';

export const DEFAULT_SIZE_X = 4;
export const DEFAULT_SIZE_Y = 1;
export const ENTRY = '1.5,0,0';

const size = variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y);

const blueprint: BuilderBlueprint = {
  type: 'RimsTube',
  title: 'RIMS',
  cards: [
    {
      component: 'SizeCard',
      props: {
        settingsKey: WIDTH_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 3,
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
      props: {},
    },
  ],
  size,
  transitions: (part: PersistentPart): Transitions => {
    const [width] = size(part);
    const rightOut = new Coordinates([width - 0.5, 0, 0]).toString();
    return {
      [ENTRY]: [{ outCoords: rightOut, friction: width - 1 }],
      [rightOut]: [{ outCoords: ENTRY, friction: width - 1 }],
    };
  },
};

export default blueprint;
