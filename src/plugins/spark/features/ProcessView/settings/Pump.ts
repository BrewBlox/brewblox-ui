import { ComponentSettings, FlowPart, PersistentPart } from '../state';
import { LEFT, RIGHT } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: (part: PersistentPart) => {
    const p = (part.settings || {}).disabled ? 0 : (part.settings || {}).pressure || 10;
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT, pressure: p }],
    };
  },
};

export default settings;
