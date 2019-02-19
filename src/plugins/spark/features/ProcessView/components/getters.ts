import { ComponentSettings } from '../state';

export const defaultSettings: ComponentSettings = {
  isBridge: false,
  isSource: false,
  cards: [],
  size: () => [1, 1],
  transitions: () => ({}),
};
