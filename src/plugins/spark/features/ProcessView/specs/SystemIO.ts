import { IN_OUT, RIGHT, defaultSpec } from '../getters';
import { ComponentSpec, PersistentPart } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [{ component: 'LiquidSourceCard' }],
  transitions: (part: PersistentPart) => ({
    [IN_OUT]: [{
      outCoords: RIGHT,
      pressure: part.settings.pressure || 0,
      liquids: part.settings.liquids || [],
    }],
    [RIGHT]: [{ outCoords: IN_OUT }],
  }),
};

export default spec;
