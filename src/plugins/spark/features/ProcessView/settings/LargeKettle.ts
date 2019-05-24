import { defaultSettings } from '../getters';
import { ComponentSettings } from '../types';

const SIZE_X = 6;
const SIZE_Y = 8;

const settings: ComponentSettings = {
  ...defaultSettings,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
};

export default settings;
