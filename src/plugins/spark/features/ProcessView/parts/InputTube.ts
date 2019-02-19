import { ComponentSettings } from '../state';
import { CENTER, RIGHT } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  isSource: true,
  cards: ['LiquidSourcePartCard'],
  transitions: () => ({
    [CENTER]: [{ outCoords: RIGHT }],
  }),
};

export default settings;
