import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';

const DEFAULT_SIZE_X = 4;
const DEFAULT_SIZE_Y = 12;

const blueprint: BuilderBlueprint = {
  type: 'Fridge',
  title: 'Fridge',
  cards: [
    { component: 'TextCard' },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'shelfY',
        defaultSize: 1,
        label: 'Shelf position (from top)',
        min: 1,
        max: 14,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 4,
        max: 15,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeY',
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 4,
        max: 15,
      },
    },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    part.settings.sizeY || DEFAULT_SIZE_Y,
  ],
  transitions: () => ({}),
};

export default blueprint;
