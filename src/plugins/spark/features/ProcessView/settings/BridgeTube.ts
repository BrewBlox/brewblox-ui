import { ComponentSettings } from '../state';
import { LEFT, RIGHT, DOWN, UP } from '../getters';
import { defaultSettings } from '../components/getters';

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
