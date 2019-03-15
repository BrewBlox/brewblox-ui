import { ComponentSettings } from '../state';
import { LEFT, RIGHT, UP, DOWN } from '../getters';
import { defaultSettings } from '../components/getters';

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
