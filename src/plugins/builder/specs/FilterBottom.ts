import { IN_OUT, LEFT, defaultSpec } from '../getters';
import { ComponentSpec, PersistentPart } from '../types';

const DEFAULT_SIZE_X = 4;
const SIZE_Y = 1;

const spec: ComponentSpec = {
  ...defaultSpec,
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
    [LEFT]: [{ outCoords: IN_OUT }],
    [IN_OUT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
