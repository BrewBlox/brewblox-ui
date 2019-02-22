import { ComponentSettings, FlowPart, PersistentPart } from '../state';
import { LEFT, RIGHT } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: (part: PersistentPart) => {
    const p = part.disabled ? 0 : 10;
    return {
      [LEFT]: [{ outCoords: RIGHT, deltaPressure: -p }],
      [RIGHT]: [{ outCoords: LEFT, deltaPressure: p }],
    };
  },
};

export default settings;
