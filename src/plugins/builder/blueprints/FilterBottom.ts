import { CENTER, LEFT } from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';

const DEFAULT_SIZE_X = 4;
const SIZE_Y = 1;

const blueprint: BuilderBlueprint = {
  type: 'FilterBottom',
  title: 'Filter: bottom',
  cards: [
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 1,
        max: 15,
      },
    },
    { component: 'LiquidSourceCard' },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    SIZE_Y,
  ],
  transitions: () => ({
    [LEFT]: [{ outCoords: CENTER }],
    [CENTER]: [{ outCoords: LEFT }],
  }),
};

export default blueprint;
