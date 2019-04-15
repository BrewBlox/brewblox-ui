import { ComponentSettings } from '../state';
import { LEFT, RIGHT, defaultSettings } from '../getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    [LEFT]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: LEFT }],
  }),
};

export default settings;
