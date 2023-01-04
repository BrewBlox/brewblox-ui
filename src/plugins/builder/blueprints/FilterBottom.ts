import { CENTER, LEFT, WIDTH_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import { variableSizeFunc } from '../utils';

export const DEFAULT_SIZE_X = 4;
export const DEFAULT_SIZE_Y = 1;

const blueprint: BuilderBlueprint = {
  type: 'FilterBottom',
  title: 'Filter: bottom',
  cards: [
    {
      component: 'SizeCard',
      props: {
        settingsKey: WIDTH_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 1,
        max: 15,
      },
    },
  ],
  size: variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y),
  transitions: () => ({
    [LEFT]: [{ outCoords: CENTER }],
    [CENTER]: [{ outCoords: LEFT }],
  }),
};

export default blueprint;
