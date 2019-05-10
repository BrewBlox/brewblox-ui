import { ComponentSettings } from '../types';
import { LEFT, RIGHT, UP, DOWN, defaultSettings } from '../getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }, { outCoords: LEFT }, { outCoords: DOWN }],
    [RIGHT]: [{ outCoords: UP }, { outCoords: LEFT }, { outCoords: DOWN }],
    [LEFT]: [{ outCoords: UP }, { outCoords: RIGHT }, { outCoords: DOWN }],
    [DOWN]: [{ outCoords: UP }, { outCoords: LEFT }, { outCoords: RIGHT }],
  }),
};

export default settings;
