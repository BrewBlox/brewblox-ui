import { ComponentSettings } from '../state';
import { LEFT, RIGHT, UP } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }, { outCoords: LEFT }],
    [RIGHT]: [{ outCoords: UP }, { outCoords: LEFT }],
    [LEFT]: [{ outCoords: UP }, { outCoords: RIGHT }],
  }),
};

export default settings;
