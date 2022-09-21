import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import { containerTransitions } from '@/plugins/builder/utils';

export const DEFAULT_FILL_PCT = 85;
export const DEFAULT_SIZE_X = 4;
export const DEFAULT_SIZE_Y = 6;

const size = (part: PersistentPart): [number, number] => [
  part.settings.sizeX || DEFAULT_SIZE_X,
  part.settings.sizeY || DEFAULT_SIZE_Y,
];

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
        settingsKey: 'sizeX',
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 10,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeY',
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
