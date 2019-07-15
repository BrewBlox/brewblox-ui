import { LEFT, RIGHT, defaultSpec } from '../getters';
import { ComponentSpec, PartUpdater, PersistentPart, Transitions } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
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
