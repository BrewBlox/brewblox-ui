import { LEFT, RIGHT } from '@/plugins/builder/const';
import { PartSpec, PartUpdater, PersistentPart, Transitions } from '@/plugins/builder/types';

const spec: PartSpec = {
  id: 'Valve',
  title: 'Valve: manual',
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
