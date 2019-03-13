import { ComponentSettings, PersistentPart } from '../state';
import { Coordinates } from '@/helpers/coordinates';

export const defaultSettings: ComponentSettings = {
  cards: [],
  size: () => [1, 1],
  transitions: () => ({}),
  blockedCoordinates: (part: PersistentPart): Coordinates[] => [new Coordinates(part)],
};
