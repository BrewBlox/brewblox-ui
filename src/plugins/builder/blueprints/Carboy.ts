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
export const DEFAULT_SIZE_Y = 4;

const size = variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y);

const blueprint: BuilderBlueprint = {
  type: 'Carboy',
  title: 'Carboy',
  transitions: () => ({}),
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
      component: 'ColorCard',
      props: {
        settingsKey: COLOR_KEY,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: WIDTH_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
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
        max: 10,
      },
    },
  ],
  size,
};

export default blueprint;
