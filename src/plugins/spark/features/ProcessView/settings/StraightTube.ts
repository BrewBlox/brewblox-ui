import { LEFT, RIGHT, defaultSettings } from '../getters';
import { ComponentSettings } from '../types';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    [LEFT]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: LEFT }],
  }),
};

export default settings;
