import { ComponentSettings, Transitions } from '../state';
import { LEFT, RIGHT } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: (): Transitions => ({
    [LEFT]: [{ outCoords: RIGHT }],
  }),
};

export default settings;
