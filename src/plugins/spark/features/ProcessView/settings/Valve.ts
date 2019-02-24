import { ComponentSettings, PersistentPart, Transitions } from '../state';
import { LEFT, RIGHT } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: (part: PersistentPart): Transitions => {
    if ((part.settings || {}).closed) {
      return {};
    }
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT }],
    };
  },
};

export default settings;
