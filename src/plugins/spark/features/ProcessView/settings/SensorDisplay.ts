import { ComponentSettings } from '../state';
import { defaultSettings } from '../getters';

const SIZE_X = 1;
const SIZE_Y = 1;

const settings: ComponentSettings = {
  ...defaultSettings,
  cards: ['SensorPartCard'],
  size: () => [SIZE_X, SIZE_Y],
};

export default settings;
