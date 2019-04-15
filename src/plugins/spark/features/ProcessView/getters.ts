import { ComponentSettings, PersistentPart } from './state';
import { Coordinates } from '@/helpers/coordinates';

export const SQUARE_SIZE = 50;
export const UP = '0.5,0,0';
export const RIGHT = '1,0.5,0';
export const DOWN = '0.5,1,0';
export const LEFT = '0,0.5,0';
export const IN_OUT = '0.5,0.5,-1';
export const ACCELERATE_OTHERS = '*ACCELERATE_OTHERS*';
export const DEFAULT_FRICTION = 1;
export const DEFAULT_PUMP_PRESSURE = 10;
export const COLD_WATER = '#4AA0EF';
export const HOT_WATER = '#DB0023';
export const BEER = '#E1AC00';
export const WORT = '#C78A49';

export const defaultSettings: ComponentSettings = {
  cards: [],
  size: () => [1, 1],
  transitions: () => ({}),
  blockedCoordinates: (part: PersistentPart): Coordinates[] => [new Coordinates([part.x, part.y, 0])],
};
