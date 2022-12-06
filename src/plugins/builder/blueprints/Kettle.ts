import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import {
  containerTransitions,
  variableSizeFunc,
} from '@/plugins/builder/utils';
import { SIZE_X_KEY, SIZE_Y_KEY } from '../const';

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
        settingsKey: 'text',
      },
    },
    { component: 'ColorCard' },
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
        settingsKey: 'fillPct',
        defaultSize: DEFAULT_FILL_PCT,
        label: 'Liquid level (%)',
        min: 0,
        max: 100,
      },
    },
  ],
  size,
  transitions: (part: PersistentPart) =>
    containerTransitions(size(part), part.settings.color),
};

export default blueprint;
