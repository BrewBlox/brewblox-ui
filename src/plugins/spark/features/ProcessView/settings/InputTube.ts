import { ComponentSettings, PersistentPart } from '../state';
import { IN_OUT, RIGHT } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  cards: ['LiquidSourcePartCard'],
  transitions: (part: PersistentPart) => ({
    [IN_OUT]: [{ outCoords: RIGHT, pressure: (part.settings || {}).pressure || 10 }],
    [RIGHT]: [{ outCoords: IN_OUT }],
  }),
};

export default settings;
