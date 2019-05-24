import { IN_OUT, RIGHT, defaultSettings } from '../getters';
import { ComponentSettings, PersistentPart } from '../types';

const settings: ComponentSettings = {
  ...defaultSettings,
  cards: ['LiquidSourcePartCard'],
  transitions: (part: PersistentPart) => ({
    [IN_OUT]: [{
      outCoords: RIGHT,
      pressure: part.settings.pressure || 0,
      liquids: part.settings.liquids || [],
    }],
    [RIGHT]: [{ outCoords: IN_OUT }],
  }),
};

export default settings;
