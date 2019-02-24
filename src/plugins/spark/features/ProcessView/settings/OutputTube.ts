import { ComponentSettings } from '../state';
import { LEFT, IN_OUT } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    [LEFT]: [{ outCoords: IN_OUT, pressure: 0 }],
  }),
};

export default settings;
