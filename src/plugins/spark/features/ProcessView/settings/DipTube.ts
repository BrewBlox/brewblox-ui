import { ComponentSettings } from '../types';
import { LEFT, IN_OUT, defaultSettings } from '../getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  transitions: () => ({
    [LEFT]: [{ outCoords: IN_OUT }],
    [IN_OUT]: [{ outCoords: LEFT }],
  }),
};

export default settings;
