import { SCALE_KEY } from '@/plugins/builder/const';
import { PartSpec } from '@/plugins/builder/types';

export const SIZE_X = 1;
export const SIZE_Y = 2;


const spec: PartSpec = {
  id: 'BeerBottle',
  title: 'Beer bottle',
  cards: [
    { component: 'ColorCard' },
    {
      component: 'ScaleCard',
      props: {
        settingsKey: SCALE_KEY,
        defaultSize: [SIZE_X, SIZE_Y],
      },
    },
  ],
  size: ({ settings }) => {
    const scale = settings[SCALE_KEY] ?? 1;
    return [SIZE_X * scale, SIZE_Y * scale];
  },
  transitions: () => ({}),
};

export default spec;
