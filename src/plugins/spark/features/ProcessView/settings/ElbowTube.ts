import { ComponentSettings } from '../state';
import { RIGHT, UP } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    [UP]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: UP }],
  }),
};

export default settings;
