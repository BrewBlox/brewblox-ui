import {
  COLOR_KEY,
  HEIGHT_KEY,
  SETPOINT_KEY,
  SETPOINT_TYPES,
  WIDTH_KEY,
} from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const DEFAULT_SIZE_X = 2;
export const DEFAULT_SIZE_Y = 5;

export const MIN_SIZE: AreaSize = { width: 1, height: 2 };
export const MAX_SIZE: AreaSize = { width: 8, height: 20 };
export const DEFAULT_SIZE: AreaSize = { width: 2, height: 5 };

const blueprint: BuilderBlueprint = {
  type: 'Keg',
  title: 'Keg',
  transitions: () => ({}),
  cards: [
    {
      component: 'ColorCard',
      props: {
        settingsKey: COLOR_KEY,
      },
    },
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: SETPOINT_KEY,
        compatible: SETPOINT_TYPES,
        label: 'Setpoint',
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: WIDTH_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 1,
        max: 8,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: HEIGHT_KEY,
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 2,
        max: 20,
      },
    },
  ],
  size: variableSizeFunc(DEFAULT_SIZE),
};

export default blueprint;
