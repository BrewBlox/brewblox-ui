import { LEFT, RIGHT } from '../getters';
import { PartSpec, PartUpdater, PersistentPart, Transitions } from '../types';

const spec: PartSpec = {
  id: 'Valve',
  cards: [],
  size: () => [1, 1],
  transitions: (part: PersistentPart): Transitions =>
    ((part.settings || {}).closed)
      ? {}
      : {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      },
  interactHandler: (part: PersistentPart, updater: PartUpdater) => {
    part.settings.closed = !part.settings.closed;
    updater.updatePart(part);
  },
};

export default spec;
