import { IN_OUT, RIGHT } from '../getters';
import { PartSpec, PersistentPart } from '../types';

const spec: PartSpec = {
  id: 'SystemIO',
  size: () => [1, 1],
  cards: [{ component: 'LiquidSourceCard' }],
  transitions: (part: PersistentPart) => ({
    [IN_OUT]: [{
      outCoords: RIGHT,
      pressure: part.settings.pressure || 0,
      liquids: part.settings.liquids || [],
      source: true,
    }],
    [RIGHT]: [{ outCoords: IN_OUT, sink: true }],
  }),
};

export default spec;
