import { ComponentSettings } from '../types';
import { LEFT, RIGHT, UP, defaultSettings } from '../getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }, { outCoords: LEFT }],
    [RIGHT]: [{ outCoords: UP }, { outCoords: LEFT }],
    [LEFT]: [{ outCoords: UP }, { outCoords: RIGHT }],
  }),
};

export default settings;
