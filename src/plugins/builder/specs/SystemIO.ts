import { CENTER, RIGHT } from '../getters';
import { PartSpec, PersistentPart } from '../types';

const spec: PartSpec = {
  id: 'SystemIO',
  size: () => [1, 1],
  cards: [{ component: 'LiquidSourceCard' }],
  transitions: (part: PersistentPart) => ({
    [CENTER]: [{
      outCoords: RIGHT,
      pressure: part.settings.pressure || 0,
      liquids: part.settings.pressure ? part.settings.liquids || [] : [],
      source: true,
    }],
    [RIGHT]: [{ outCoords: CENTER, sink: true }],
  }),
};

export default spec;
