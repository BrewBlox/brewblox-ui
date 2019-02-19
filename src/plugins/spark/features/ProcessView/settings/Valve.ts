import { ComponentSettings, FlowPart, Transitions } from '../state';
import { LEFT, RIGHT } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: (part: FlowPart): Transitions => {
    if (part.closed) {
      return {};
    }
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT }],
    };
  },
};

export default settings;
