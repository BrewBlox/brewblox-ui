import { SCALE_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

export const SIZE_X = 1;
export const SIZE_Y = 2;

const blueprint: BuilderBlueprint = {
  type: 'BeerBottle',
  title: 'Beer bottle',
  cards: [
    { component: 'ColorCard' },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: SIZE_X,
        label: 'Width',
        min: 1,
        max: 5,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeY',
        defaultSize: SIZE_Y,
        label: 'Height',
        min: 1,
        max: 10,
      },
    },
  ],
  size: ({ settings }) => {
    if (settings.sizeX !== undefined || settings.sizeY !== undefined) {
      return [settings.sizeX || SIZE_X, settings.sizeY || SIZE_Y];
    }
    // backwards compatibility with deprecated setting
    if (settings[SCALE_KEY] != null) {
      const scale = Number(settings[SCALE_KEY]);
      return [SIZE_X * scale, SIZE_Y * scale];
    }
    return [SIZE_X, SIZE_Y];
  },
  transitions: () => ({}),
};

export default blueprint;
