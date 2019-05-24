import { LEFT, RIGHT, defaultSettings } from '../getters';
import { ComponentSettings, Transitions } from '../types';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: (): Transitions => ({
    [LEFT]: [{ outCoords: RIGHT }],
  }),
};

export default settings;
