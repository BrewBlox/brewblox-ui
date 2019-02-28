import { ComponentSettings, PersistentPart } from '../state';
import { LEFT, RIGHT, DEFAULT_PUMP_PRESSURE, ACCELERATE_OTHERS } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: (part: PersistentPart) => {
    const p = (part.settings || {}).disabled ? 0 : part.settings.pressure || DEFAULT_PUMP_PRESSURE;
    return {
      [LEFT]: [{ outCoords: RIGHT, pressure: -p, liquids: [ACCELERATE_OTHERS] }],
      [RIGHT]: [{ outCoords: LEFT, pressure: p, liquids: [ACCELERATE_OTHERS] }],
    };
  },
};

export default settings;
