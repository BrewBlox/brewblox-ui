import { CENTER, LEFT } from '../getters';
import { PartSpec, PersistentPart } from '../types';

const DEFAULT_SIZE_X = 4;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'FilterBottom',
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

export default spec;
