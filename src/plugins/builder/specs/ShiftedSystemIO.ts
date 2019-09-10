import { CENTER, UP } from '../getters';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 2;
const SIZE_Y = 2;

const spec: PartSpec = {
  id: 'ShiftedSystemIO',
  size: () => [SIZE_X, SIZE_Y],
  cards: [{ component: 'LiquidSourceCard' }],
  transitions: (part: PersistentPart) => ({
    [CENTER]: [{
      outCoords: UP,
      pressure: part.settings.pressure || 0,
      liquids: part.settings.liquids || [],
      source: true,
    }],
    [UP]: [{ outCoords: CENTER, sink: true }],
  }),
};

export default spec;
