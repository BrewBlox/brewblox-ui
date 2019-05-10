import { ComponentSettings } from '../types';
import { LEFT, RIGHT, DOWN, UP, defaultSettings } from '../getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    // bridge (high)
    [LEFT]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: LEFT }],
    // straight (low)
    [UP]: [{ outCoords: DOWN }],
    [DOWN]: [{ outCoords: UP }],
  }),
};

export default settings;
