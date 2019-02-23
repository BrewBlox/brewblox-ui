import { ComponentSettings } from '../state';

export const defaultSettings: ComponentSettings = {
  isBridge: false,
  isSource: false,
  isSink: false,
  cards: [],
  size: () => [1, 1],
  transitions: () => ({}),
};
