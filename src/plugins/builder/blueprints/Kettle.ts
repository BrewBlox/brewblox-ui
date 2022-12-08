import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import {
  containerTransitions,
  variableSizeFunc,
} from '@/plugins/builder/utils';
import { COLOR_KEY, LABEL_KEY, SIZE_X_KEY, SIZE_Y_KEY } from '../const';

export const KETTLE_FILL_PCT_KEY = 'fillPct';
export const DEFAULT_FILL_PCT = 85;
export const DEFAULT_SIZE_X = 4;
export const DEFAULT_SIZE_Y = 6;

const size = variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y);

const blueprint: BuilderBlueprint = {
  type: 'Kettle',
  title: 'Kettle',
  cards: [
    {
      component: 'TextCard',
      props: {
        settingsKey: LABEL_KEY,
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
        settingsKey: SIZE_X_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 10,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: SIZE_Y_KEY,
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 2,
        max: 10,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: KETTLE_FILL_PCT_KEY,
        defaultSize: DEFAULT_FILL_PCT,
        label: 'Liquid level (%)',
        min: 0,
        max: 100,
      },
    },
  ],
  size,
  transitions: (part: PersistentPart) =>
    containerTransitions(size(part), part.settings[COLOR_KEY]),
};

export default blueprint;
