import { ComponentSettings, Transitions, StatePart, PartUpdater } from '../types';
import { LEFT, RIGHT, defaultSettings } from '../getters';

const settings: ComponentSettings = {
  ...defaultSettings,
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

export default settings;
