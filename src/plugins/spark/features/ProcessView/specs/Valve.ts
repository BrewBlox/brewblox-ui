import { LEFT, RIGHT, defaultSpec } from '../getters';
import { ComponentSpec, PartUpdater, StatePart, Transitions } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  transitions: (part: StatePart): Transitions =>
    ((part.settings || {}).closed)
      ? {}
      : {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      },
  interactHandler: (part: StatePart, updater: PartUpdater) => {
    part.settings.closed = !part.settings.closed;
    updater.updatePart(part);
  },
};

export default spec;
