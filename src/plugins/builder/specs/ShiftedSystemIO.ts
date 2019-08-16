import { IN_OUT, UP, defaultSpec } from '../getters';
import { ComponentSpec, PersistentPart } from '../types';

const SIZE_X = 2;
const SIZE_Y = 2;

const spec: ComponentSpec = {
  ...defaultSpec,
  size: () => [SIZE_X, SIZE_Y],
  cards: [{ component: 'LiquidSourceCard' }],
  transitions: (part: PersistentPart) => ({
    [IN_OUT]: [{
      outCoords: UP,
      pressure: part.settings.pressure || 0,
      liquids: part.settings.liquids || [],
    }],
    [UP]: [{ outCoords: IN_OUT }],
  }),
};

export default spec;
