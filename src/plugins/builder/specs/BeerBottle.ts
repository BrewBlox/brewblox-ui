import { PartSpec } from '../types';

const SIZE_X = 1;
const SIZE_Y = 2;
const scaleKey = 'scale';

const spec: PartSpec = {
  id: 'BeerBottle',
  title: 'Beer bottle',
  cards: [
    { component: 'ColorCard' },
    {
      component: 'ScaleCard',
      props: {
        settingsKey: scaleKey,
        defaultSize: [SIZE_X, SIZE_Y],
      },
    },
  ],
  size: ({ settings }) => {
    const scale = settings[scaleKey] ?? 1;
    return [SIZE_X * scale, SIZE_Y * scale];
  },
  transitions: () => ({}),
};

export default spec;
