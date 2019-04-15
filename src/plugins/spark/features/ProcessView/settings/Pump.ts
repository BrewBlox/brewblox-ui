import { ComponentSettings, StatePart, PartUpdater } from '../state';
import { LEFT, RIGHT, DEFAULT_PUMP_PRESSURE, ACCELERATE_OTHERS, defaultSettings } from '../getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: (part: StatePart) => {
    const p = (part.settings || {}).disabled ? 0 : part.settings.pressure || DEFAULT_PUMP_PRESSURE;
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT, pressure: p, liquids: [ACCELERATE_OTHERS] }],
    };
  },
  interactHandler: (part: StatePart, updater: PartUpdater) => {
    part.settings.disabled = !part.settings.disabled;
    updater.updatePart(part);
  },
};

export default settings;
