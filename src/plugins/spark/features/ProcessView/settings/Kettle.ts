import { ComponentSettings } from '../state';
import { defaultSettings } from '../components/getters';

const SIZE_X = 4;
const SIZE_Y = 6;

const settings: ComponentSettings = {
  ...defaultSettings,
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
};

export default settings;
