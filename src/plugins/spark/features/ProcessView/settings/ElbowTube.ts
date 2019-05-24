import { RIGHT, UP, defaultSettings } from '../getters';
import { ComponentSettings } from '../types';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: UP }],
  }),
};

export default settings;
