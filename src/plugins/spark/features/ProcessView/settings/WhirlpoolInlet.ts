import { ComponentSettings } from '../types';
import { LEFT, IN_OUT, defaultSettings } from '../getters';

const SIZE_X = 1;
const SIZE_Y = 4;

const settings: ComponentSettings = {
  ...defaultSettings,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: IN_OUT }],
    [IN_OUT]: [{ outCoords: LEFT }],
  }),
};

export default settings;
