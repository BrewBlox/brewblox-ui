import { CENTER, LEFT, SIZE_X_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

const DEFAULT_SIZE_X = 4;
const SIZE_Y = 1;

const blueprint: BuilderBlueprint = {
  type: 'FilterBottom',
  title: 'Filter: bottom',
  cards: [
    {
      component: 'SizeCard',
      props: {
        settingsKey: SIZE_X_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 1,
        max: 15,
      },
    },
    { component: 'LiquidSourceCard' },
  ],
  size: variableSizeFunc(DEFAULT_SIZE_X, SIZE_Y),
  transitions: () => ({
    [LEFT]: [{ outCoords: CENTER }],
    [CENTER]: [{ outCoords: LEFT }],
  }),
};

export default blueprint;
