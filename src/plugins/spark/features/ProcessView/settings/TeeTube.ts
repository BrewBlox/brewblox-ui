import { LEFT, RIGHT, UP, defaultSettings } from '../getters';
import { ComponentSettings } from '../types';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }, { outCoords: LEFT }],
    [RIGHT]: [{ outCoords: UP }, { outCoords: LEFT }],
    [LEFT]: [{ outCoords: UP }, { outCoords: RIGHT }],
  }),
};

export default settings;
