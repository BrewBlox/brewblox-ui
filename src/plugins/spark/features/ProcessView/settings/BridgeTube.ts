import { DOWN, LEFT, RIGHT, UP, defaultSettings } from '../getters';
import { ComponentSettings } from '../types';

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
