import { ComponentSettings, Transitions } from '../state';
import { LEFT, RIGHT, defaultSettings } from '../getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: (): Transitions => ({
    [LEFT]: [{ outCoords: RIGHT }],
  }),
};

export default settings;
